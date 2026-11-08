import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import type {
  ChangeDecisionInput,
  ChangeListQuery,
  ChangeRequestInput,
} from "./change-requests.schema";

const FIELD_BOLEH_DIUBAH = [
  "title",
  "organizerName",
  "description",
  "startDate",
  "endDate",
  "registrationDeadline",
  "registrationUrl",
  "contact",
  "format",
  "teamCount",
  "registrationMethod",
  "prizePool",
  "requirements",
] as const;

type FieldPerubahan = (typeof FIELD_BOLEH_DIUBAH)[number];
type PayloadPerubahan = Partial<Record<FieldPerubahan, unknown>>;

async function ambilTurnamen(tournamentId: string) {
  const turnamen = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      title: true,
      slug: true,
      managerId: true,
      submissionId: true,
      submission: { select: { status: true } },
    },
  });

  if (!turnamen) throw ApiError.notFound("Turnamen tidak ditemukan.");
  return turnamen;
}

/** Hanya pengelola turnamen (atau admin) yang boleh mengajukan perubahan. */
async function pastikanPengelola(user: AuthUser, tournamentId: string) {
  const turnamen = await ambilTurnamen(tournamentId);

  if (user.role !== "ADMIN" && turnamen.managerId !== user.id) {
    throw ApiError.notFound("Turnamen tidak ditemukan.");
  }

  return turnamen;
}

function rapikan(nilai: unknown): unknown {
  if (typeof nilai === "string" && nilai.trim().length === 0) return null;
  return nilai;
}

export async function ajukanPerubahan(
  user: AuthUser,
  tournamentId: string,
  input: ChangeRequestInput,
) {
  const turnamen = await pastikanPengelola(user, tournamentId);

  if (!turnamen.managerId) {
    throw ApiError.conflict(
      "Turnamen ini tidak memiliki pengelola. Hubungi administrator untuk perubahan.",
    );
  }

  const menunggu = await prisma.tournamentChangeRequest.findFirst({
    where: { tournamentId, status: "PENDING" },
    select: { id: true },
  });

  if (menunggu) {
    throw ApiError.conflict(
      "Masih ada permintaan perubahan yang menunggu tinjauan admin untuk turnamen ini.",
    );
  }

  const { message, ...sisa } = input;

  const payload: PayloadPerubahan = {};
  for (const field of FIELD_BOLEH_DIUBAH) {
    const nilai = (sisa as Record<string, unknown>)[field];
    if (nilai !== undefined) payload[field] = rapikan(nilai);
  }

  const dibuat = await prisma.tournamentChangeRequest.create({
    data: {
      tournamentId,
      requestedBy: user.id,
      payload: JSON.stringify(payload),
      message,
    },
    select: { id: true, status: true, createdAt: true },
  });

  return dibuat;
}

export async function daftarPerubahan(user: AuthUser, tournamentId: string) {
  await pastikanPengelola(user, tournamentId);

  const items = await prisma.tournamentChangeRequest.findMany({
    where: { tournamentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      payload: true,
      message: true,
      status: true,
      adminNote: true,
      reviewedAt: true,
      createdAt: true,
      reviewer: { select: { name: true, username: true } },
    },
  });

  return items.map((item) => ({ ...item, payload: JSON.parse(item.payload) as PayloadPerubahan }));
}

export async function daftarAntreanAdmin(query: ChangeListQuery) {
  const where: Prisma.TournamentChangeRequestWhereInput = query.status
    ? { status: query.status }
    : {};

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.tournamentChangeRequest.count({ where }),
    prisma.tournamentChangeRequest.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take: query.limit,
      select: {
        id: true,
        payload: true,
        message: true,
        status: true,
        adminNote: true,
        createdAt: true,
        reviewedAt: true,
        tournament: { select: { id: true, title: true, slug: true } },
        requester: { select: { id: true, name: true, username: true } },
        reviewer: { select: { name: true, username: true } },
      },
    }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      payload: JSON.parse(item.payload) as PayloadPerubahan,
    })),
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function putuskanPerubahan(
  admin: AuthUser,
  id: string,
  input: ChangeDecisionInput,
) {
  const permintaan = await prisma.tournamentChangeRequest.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      payload: true,
      tournamentId: true,
      requestedBy: true,
      tournament: { select: { title: true, managerId: true } },
    },
  });

  if (!permintaan) throw ApiError.notFound("Permintaan perubahan tidak ditemukan.");

  if (permintaan.status !== "PENDING") {
    throw ApiError.conflict("Permintaan ini sudah diputuskan.");
  }

  const payload = JSON.parse(permintaan.payload) as PayloadPerubahan;

  await prisma.$transaction(async (tx) => {
    if (input.decision === "APPROVED") {
      const data: Prisma.TournamentUpdateInput = {};

      for (const field of FIELD_BOLEH_DIUBAH) {
        if (payload[field] === undefined) continue;
        const nilai = payload[field];

        if (field === "startDate" || field === "endDate") {
          if (typeof nilai === "string") data[field] = new Date(nilai);
          continue;
        }

        if (field === "registrationDeadline") {
          data.registrationDeadline =
            typeof nilai === "string" && nilai.length > 0 ? new Date(nilai) : null;
          continue;
        }

        (data as Record<string, unknown>)[field] = nilai;
      }

      await tx.tournament.update({ where: { id: permintaan.tournamentId }, data });
    }

    await tx.tournamentChangeRequest.update({
      where: { id },
      data: {
        status: input.decision,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        adminNote: input.note ?? null,
      },
    });

    await tx.notification.create({
      data: {
        userId: permintaan.requestedBy,
        type:
          input.decision === "APPROVED" ? "CHANGE_REQUEST_APPROVED" : "CHANGE_REQUEST_REJECTED",
        title:
          input.decision === "APPROVED"
            ? "Permintaan perubahan disetujui"
            : "Permintaan perubahan ditolak",
        message:
          input.decision === "APPROVED"
            ? `Perubahan informasi pada turnamen "${permintaan.tournament.title}" telah disetujui dan diterapkan.`
            : `Perubahan pada turnamen "${permintaan.tournament.title}" ditolak. ${input.note ?? ""}`
                .replace(/\s+/g, " ")
                .trim(),
        referenceId: permintaan.tournamentId,
      },
    });
  });

  return { id, decision: input.decision };
}
