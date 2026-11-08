import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import type {
  AdminTournamentsQuery,
  ReviewResultsInput,
  SubmitResultsInput,
} from "./management.schema";

async function ambilTurnamen(id: string) {  const turnamen = await prisma.tournament.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      managerId: true,
      isPublished: true,
      submissionId: true,
      submission: { select: { status: true } },
    },
  });

  if (!turnamen) {
    throw ApiError.notFound("Turnamen tidak ditemukan.");
  }

  return turnamen;
}

/**
 * Penyelenggara hanya boleh mengelola turnamen yang managerId-nya dia sendiri.
 * Admin boleh semuanya. Turnamen milik pihak lain dibalas 404 agar keberadaannya
 * tidak terbocorkan.
 */
export async function pastikanBolehKelola(user: AuthUser, tournamentId: string) {
  const turnamen = await ambilTurnamen(tournamentId);

  if (user.role !== "ADMIN" && turnamen.managerId !== user.id) {
    throw ApiError.notFound("Turnamen tidak ditemukan.");
  }

  return turnamen;
}

export async function ambilHasilUntukDikelola(user: AuthUser, tournamentId: string) {
  const turnamen = await pastikanBolehKelola(user, tournamentId);

  const hasil = await prisma.tournamentResult.findMany({
    where: { tournamentId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      position: true,
      teamOrPlayer: true,
      note: true,
      status: true,
      adminNote: true,
      reviewedAt: true,
      updatedAt: true,
      reviewer: { select: { name: true, username: true } },
    },
  });

  return { turnamen, hasil };
}

export async function ajukanHasil(
  user: AuthUser,
  tournamentId: string,
  input: SubmitResultsInput,
) {
  await pastikanBolehKelola(user, tournamentId);

  return prisma.$transaction(async (tx) => {
    const posisiLama = await tx.tournamentResult.findMany({
      where: { tournamentId },
      select: { id: true, position: true, teamOrPlayer: true, note: true, status: true },
    });

    const posisiBaru = new Set(input.results.map((r) => r.position));

    const barisDihapus = posisiLama.filter((baris) => !posisiBaru.has(baris.position));

    if (user.role !== "ADMIN") {
      const disetujui = barisDihapus.filter((baris) => baris.status === "APPROVED");

      if (disetujui.length > 0) {
        const daftarPeringkat = disetujui.map((baris) => baris.position).join(", ");
        throw ApiError.conflict(
          `Hasil peringkat ${daftarPeringkat} sudah disetujui dan tidak dapat dihapus. Ajukan perubahan pada hasil tersebut agar ditinjau ulang.`,
        );
      }
    }

    const idDihapus = barisDihapus.map((baris) => baris.id);

    if (idDihapus.length > 0) {
      await tx.tournamentResultReview.deleteMany({ where: { resultId: { in: idDihapus } } });
      await tx.tournamentResult.deleteMany({ where: { id: { in: idDihapus } } });
    }

    const petaLama = new Map(posisiLama.map((baris) => [baris.position, baris]));

    for (const entri of input.results) {
      const catatan = entri.note ?? null;
      const lama = petaLama.get(entri.position);

      const tidakBerubah =
        lama !== undefined &&
        lama.teamOrPlayer === entri.teamOrPlayer &&
        (lama.note ?? null) === catatan;

      if (tidakBerubah) continue;

      const tersimpan = lama
        ? await tx.tournamentResult.update({
            where: { id: lama.id },
            data: {
              teamOrPlayer: entri.teamOrPlayer,
              note: catatan,
              status: "PENDING_REVIEW",
              submittedBy: user.id,
              updatedBy: user.id,
              reviewedBy: null,
              reviewedAt: null,
              adminNote: null,
            },
            select: { id: true },
          })
        : await tx.tournamentResult.create({
            data: {
              tournamentId,
              position: entri.position,
              teamOrPlayer: entri.teamOrPlayer,
              note: catatan,
              status: "PENDING_REVIEW",
              submittedBy: user.id,
              updatedBy: user.id,
            },
            select: { id: true },
          });

      await tx.tournamentResultReview.create({
        data: {
          resultId: tersimpan.id,
          actorId: user.id,
          action: "SUBMITTED",
          note: user.role === "ADMIN" ? "Diajukan oleh admin." : "Diajukan oleh penyelenggara.",
        },
      });
    }

    return { jumlah: input.results.length };
  });
}

export async function tinjauHasil(
  admin: AuthUser,
  tournamentId: string,
  input: ReviewResultsInput,
) {
  const turnamen = await ambilTurnamen(tournamentId);

  if (admin.role !== "ADMIN") {
    throw ApiError.forbidden("Hanya administrator yang dapat meninjau hasil.");
  }

  const menunggu = await prisma.tournamentResult.findMany({
    where: { tournamentId, status: "PENDING_REVIEW" },
    select: { id: true },
  });

  if (menunggu.length === 0) {
    throw ApiError.conflict("Tidak ada hasil yang menunggu peninjauan.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.tournamentResult.updateMany({
      where: { tournamentId, status: "PENDING_REVIEW" },
      data: {
        status: input.decision,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        adminNote: input.note ?? null,
      },
    });

    await tx.tournamentResultReview.createMany({
      data: menunggu.map((baris) => ({
        resultId: baris.id,
        actorId: admin.id,
        action: input.decision,
        note: input.note ?? null,
      })),
    });

    await catatNotifikasiHasil(tx, {
      managerId: turnamen.managerId,
      tournamentId,
      tournamentTitle: turnamen.title,
      decision: input.decision,
      note: input.note,
      jumlah: menunggu.length,
    });
  });

  return { jumlah: menunggu.length };
}

async function catatNotifikasiHasil(
  tx: Prisma.TransactionClient,
  input: {
    managerId: string | null;
    tournamentId: string;
    tournamentTitle: string;
    decision: "APPROVED" | "REJECTED";
    note?: string | undefined;
    jumlah: number;
    posisi?: number | undefined;
  },
): Promise<void> {
  if (!input.managerId) return;

  const disetujui = input.decision === "APPROVED";
  const sasaran =
    input.posisi !== undefined
      ? `hasil peringkat ${input.posisi}`
      : `${input.jumlah} hasil`;

  const pesan = disetujui
    ? `${sasaran} pada "${input.tournamentTitle}" telah disetujui dan tampil untuk publik.`
    : `${sasaran} pada "${input.tournamentTitle}" ditolak. ${input.note ?? ""} Perbaiki hasil tersebut lalu kirim ulang untuk ditinjau.`;

  await tx.notification.create({
    data: {
      userId: input.managerId,
      type: disetujui ? "RESULT_APPROVED" : "RESULT_REJECTED",
      title: disetujui ? "Hasil turnamen disetujui" : "Hasil turnamen ditolak",
      message: pesan.replace(/\s+/g, " ").trim().slice(0, 500),
      referenceId: input.tournamentId,
    },
  });
}

export async function tinjauHasilSatuan(
  admin: AuthUser,
  tournamentId: string,
  resultId: string,
  input: ReviewResultsInput,
) {
  const turnamen = await ambilTurnamen(tournamentId);

  if (admin.role !== "ADMIN") {
    throw ApiError.forbidden("Hanya administrator yang dapat meninjau hasil.");
  }

  const hasil = await prisma.tournamentResult.findFirst({
    where: { id: resultId, tournamentId },
    select: { id: true, position: true, status: true },
  });

  if (!hasil) {
    throw ApiError.notFound("Hasil pertandingan tidak ditemukan.");
  }

  if (hasil.status !== "PENDING_REVIEW") {
    throw ApiError.conflict("Hanya hasil berstatus menunggu tinjauan yang dapat diputuskan.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.tournamentResult.update({
      where: { id: resultId },
      data: {
        status: input.decision,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        adminNote: input.note ?? null,
      },
    });

    await tx.tournamentResultReview.create({
      data: {
        resultId,
        actorId: admin.id,
        action: input.decision,
        note: input.note ?? null,
      },
    });

    await catatNotifikasiHasil(tx, {
      managerId: turnamen.managerId,
      tournamentId,
      tournamentTitle: turnamen.title,
      decision: input.decision,
      note: input.note,
      jumlah: 1,
      posisi: hasil.position,
    });
  });

  return { resultId, decision: input.decision };
}

export async function aturPublikasi(
  admin: AuthUser,
  tournamentId: string,
  isPublished: boolean,
) {
  const turnamen = await ambilTurnamen(tournamentId);

  if (admin.role !== "ADMIN") {
    throw ApiError.forbidden("Hanya administrator yang dapat mengubah publikasi.");
  }

  if (isPublished) {
    if (turnamen.submission && turnamen.submission.status !== "APPROVED") {
      throw ApiError.conflict(
        "Turnamen tidak dapat dipublikasikan karena pengajuannya belum disetujui.",
      );
    }

    const hasilDisetujui = await prisma.tournamentResult.count({
      where: { tournamentId, status: "APPROVED" },
    });

    if (hasilDisetujui === 0) {
      const total = await prisma.tournamentResult.count({ where: { tournamentId } });
      if (total > 0) {
        throw ApiError.conflict(
          "Hasil turnamen belum disetujui. Setujui hasil sebelum mempublikasikan.",
        );
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.tournament.update({
      where: { id: tournamentId },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        publishedBy: isPublished ? admin.id : null,
      },
    });
  });

  return { isPublished };
}

export async function daftarTurnamenAdmin(query: AdminTournamentsQuery) {
  const where: Prisma.TournamentWhereInput = {};

  if (query.status === "published") where.isPublished = true;
  else if (query.status === "unpublished") where.isPublished = false;
  else if (query.status === "awaiting_results") {
    where.isPublished = true;
    where.results = { some: { status: "PENDING_REVIEW" } };
  }

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.tournament.count({ where }),
    prisma.tournament.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        organizerName: true,
        isPublished: true,
        publishedAt: true,
        startDate: true,
        endDate: true,
        game: { select: { id: true, title: true, slug: true } },
        manager: { select: { id: true, name: true, username: true } },
        submission: { select: { id: true, status: true } },
        results: { select: { status: true } },
      },
    }),
  ]);

  const dipetakan = items.map((item) => {
    const totalHasil = item.results.length;
    const menunggu = item.results.filter((r) => r.status === "PENDING_REVIEW").length;
    const disetujui = item.results.filter((r) => r.status === "APPROVED").length;

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      organizerName: item.organizerName,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt,
      startDate: item.startDate,
      endDate: item.endDate,
      game: item.game,
      manager: item.manager,
      submissionStatus: item.submission?.status ?? null,
      totalResults: totalHasil,
      pendingResults: menunggu,
      approvedResults: disetujui,
    };
  });

  return { items: dipetakan, total, page: query.page, limit: query.limit };
}
