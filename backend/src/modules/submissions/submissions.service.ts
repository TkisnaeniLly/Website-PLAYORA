import type { NotificationType, SubmissionStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateSubmissionInput,
  DecisionInput,
  ListSubmissionsQuery,
  UpdateSubmissionInput,
} from "./submissions.schema";

const PILIHAN_RINGKAS = {
  id: true,
  title: true,
  status: true,
  adminNote: true,
  submittedAt: true,
  reviewedAt: true,
  startDate: true,
  endDate: true,
  teamCount: true,
  prizePool: true,
  game: { select: { id: true, title: true, slug: true } },
} as const;

const PILIHAN_LENGKAP = {
  ...PILIHAN_RINGKAS,
  organizerName: true,
  description: true,
  registrationUrl: true,
  contact: true,
  registrationMethod: true,
  registrationDeadline: true,
  format: true,
  requirements: true,
  reviewer: { select: { name: true, username: true } },
  tournament: { select: { id: true, slug: true, isPublished: true } },
} as const;

const NOTIFIKASI: Record<
  SubmissionStatus | "CREATED",
  { type: NotificationType; title: string; message: (judul: string) => string }
> = {
  CREATED: {
    type: "SUBMISSION_CREATED",
    title: "Pengajuan turnamen terkirim",
    message: (judul) =>
      `Pengajuan "${judul}" berhasil dikirim dan sedang menunggu pemeriksaan admin.`,
  },
  PENDING: {
    type: "SUBMISSION_STATUS_CHANGED",
    title: "Pengajuan sedang diperiksa",
    message: (judul) =>
      `Pengajuan "${judul}" telah dikirim ulang dan sedang diperiksa admin.`,
  },
  NEEDS_REVISION: {
    type: "SUBMISSION_NEEDS_REVISION",
    title: "Pengajuan membutuhkan revisi",
    message: (judul) =>
      `Pengajuan "${judul}" membutuhkan revisi. Silakan periksa catatan admin.`,
  },
  APPROVED: {
    type: "SUBMISSION_APPROVED",
    title: "Pengajuan disetujui",
    message: (judul) =>
      `Pengajuan "${judul}" telah disetujui. Turnamen akan tampil setelah dipublikasikan.`,
  },
  REJECTED: {
    type: "SUBMISSION_REJECTED",
    title: "Pengajuan ditolak",
    message: (judul) =>
      `Pengajuan "${judul}" ditolak. Silakan periksa catatan admin untuk alasannya.`,
  },
};

type Tx = Prisma.TransactionClient;

async function catatNotifikasi(
  tx: Tx,
  input: {
    userId: string;
    submissionId: string;
    judul: string;
    jenis: keyof typeof NOTIFIKASI;
  },
): Promise<void> {
  const template = NOTIFIKASI[input.jenis];

  await tx.notification.create({
    data: {
      userId: input.userId,
      type: template.type,
      title: template.title,
      message: template.message(input.judul),
      referenceId: input.submissionId,
    },
  });
}

async function pastikanGamePublik(gameId: string): Promise<void> {
  const game = await prisma.game.findFirst({
    where: { id: gameId, status: "PUBLISHED" },
    select: { id: true },
  });

  if (!game) {
    throw ApiError.badRequest("Game tidak ditemukan atau belum dipublikasikan.", [
      { field: "gameId", message: "Pilih game yang tersedia di katalog." },
    ]);
  }
}

export async function buatPengajuan(
  userId: string,
  input: CreateSubmissionInput,
): Promise<{ id: string }> {
  await pastikanGamePublik(input.gameId);

  const pengajuan = await prisma.$transaction(async (tx) => {
    const dibuat = await tx.tournamentSubmission.create({
      data: {
        submittedBy: userId,
        gameId: input.gameId,
        title: input.title,
        organizerName: input.organizerName,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        registrationDeadline: input.registrationDeadline ?? null,
        format: input.format,
        teamCount: input.teamCount,
        prizePool: input.prizePool ?? null,
        requirements: input.requirements ?? null,
        registrationMethod: input.registrationMethod,
        registrationUrl: input.registrationUrl ?? null,
        contact: input.contact ?? null,
        status: "PENDING",
      },
      select: { id: true, title: true },
    });

    await catatNotifikasi(tx, {
      userId,
      submissionId: dibuat.id,
      judul: dibuat.title,
      jenis: "CREATED",
    });

    return dibuat;
  });

  return { id: pengajuan.id };
}

export async function daftarPengajuanSaya(
  userId: string,
  query: ListSubmissionsQuery,
): Promise<{ items: unknown[]; total: number; page: number; limit: number }> {
  const where: Prisma.TournamentSubmissionWhereInput = {
    submittedBy: userId,
    ...(query.status ? { status: query.status } : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.tournamentSubmission.count({ where }),
    prisma.tournamentSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take: query.limit,
      select: PILIHAN_RINGKAS,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function detailPengajuan(
  userId: string,
  submissionId: string,
  isAdmin: boolean,
) {
  const pengajuan = await prisma.tournamentSubmission.findUnique({
    where: { id: submissionId },
    select: { ...PILIHAN_LENGKAP, submittedBy: true },
  });

  if (!pengajuan) {
    throw ApiError.notFound("Pengajuan tidak ditemukan.");
  }

  // Pengguna lain tidak boleh mengetahui keberadaan pengajuan ini.
  if (!isAdmin && pengajuan.submittedBy !== userId) {
    throw ApiError.notFound("Pengajuan tidak ditemukan.");
  }

  const { submittedBy: _pemilik, ...sisa } = pengajuan;
  return sisa;
}

export async function perbaruiPengajuan(
  userId: string,
  submissionId: string,
  input: UpdateSubmissionInput,
): Promise<void> {
  const pengajuan = await prisma.tournamentSubmission.findUnique({
    where: { id: submissionId },
    select: { submittedBy: true, status: true, title: true },
  });

  if (!pengajuan || pengajuan.submittedBy !== userId) {
    throw ApiError.notFound("Pengajuan tidak ditemukan.");
  }

  if (pengajuan.status === "APPROVED") {
    throw ApiError.conflict(
      "Pengajuan yang sudah disetujui tidak dapat diubah. Hubungi admin untuk perubahan.",
    );
  }

  if (pengajuan.status === "REJECTED") {
    throw ApiError.conflict("Pengajuan yang ditolak tidak dapat diubah.");
  }

  if (pengajuan.status !== "NEEDS_REVISION") {
    throw ApiError.conflict(
      "Pengajuan hanya dapat diperbarui ketika berstatus Perlu Revisi.",
    );
  }

  if (input.gameId) {
    await pastikanGamePublik(input.gameId);
  }

  await prisma.$transaction(async (tx) => {
    await tx.tournamentSubmission.update({
      where: { id: submissionId },
      data: {
        ...input,
        status: "PENDING",
        adminNote: null,
        reviewedBy: null,
        reviewedAt: null,
        submittedAt: new Date(),
      },
    });

    await catatNotifikasi(tx, {
      userId,
      submissionId,
      judul: input.title ?? pengajuan.title,
      jenis: "PENDING",
    });
  });
}

export async function putuskanPengajuan(
  adminId: string,
  submissionId: string,
  input: DecisionInput,
): Promise<{ tournamentId: string | null }> {
  const pengajuan = await prisma.tournamentSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      title: true,
      status: true,
      submittedBy: true,
      gameId: true,
      organizerName: true,
      description: true,
      registrationUrl: true,
      contact: true,
      registrationMethod: true,
      startDate: true,
      endDate: true,
      registrationDeadline: true,
      format: true,
      teamCount: true,
      prizePool: true,
      requirements: true,
    },
  });

  if (!pengajuan) {
    throw ApiError.notFound("Pengajuan tidak ditemukan.");
  }

  if (pengajuan.status === "APPROVED" || pengajuan.status === "REJECTED") {
    throw ApiError.conflict(
      `Pengajuan sudah berstatus ${pengajuan.status} dan tidak dapat diputuskan ulang.`,
    );
  }

  const hasil = await prisma.$transaction(async (tx) => {
    await tx.tournamentSubmission.update({
      where: { id: submissionId },
      data: {
        status: input.decision,
        adminNote: input.note ?? null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    await tx.tournamentReview.create({
      data: {
        submissionId,
        adminId,
        decision: input.decision,
        note: input.note ?? null,
      },
    });

    await catatNotifikasi(tx, {
      userId: pengajuan.submittedBy,
      submissionId,
      judul: pengajuan.title,
      jenis: input.decision,
    });

    if (input.decision !== "APPROVED") {
      return { tournamentId: null };
    }

    const slugDasar = pengajuan.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 250);
    const slug = `${slugDasar || "turnamen"}-${submissionId.slice(0, 8)}`;

    // submission_id UNIQUE menjamin satu pengajuan hanya menghasilkan satu turnamen.
    const turnamen = await tx.tournament.upsert({
      where: { submissionId },
      update: {
        title: pengajuan.title,
        organizerName: pengajuan.organizerName,
        description: pengajuan.description,
        registrationUrl: pengajuan.registrationUrl,
        contact: pengajuan.contact,
        registrationMethod: pengajuan.registrationMethod,
        startDate: pengajuan.startDate,
        endDate: pengajuan.endDate,
        registrationDeadline: pengajuan.registrationDeadline,
        format: pengajuan.format,
        teamCount: pengajuan.teamCount,
        prizePool: pengajuan.prizePool,
        requirements: pengajuan.requirements,
        gameId: pengajuan.gameId,
      },
      create: {
        submissionId,
        gameId: pengajuan.gameId,
        managerId: pengajuan.submittedBy,
        title: pengajuan.title,
        slug,
        organizerName: pengajuan.organizerName,
        description: pengajuan.description,
        registrationUrl: pengajuan.registrationUrl,
        contact: pengajuan.contact,
        registrationMethod: pengajuan.registrationMethod,
        startDate: pengajuan.startDate,
        endDate: pengajuan.endDate,
        registrationDeadline: pengajuan.registrationDeadline,
        format: pengajuan.format,
        teamCount: pengajuan.teamCount,
        prizePool: pengajuan.prizePool,
        requirements: pengajuan.requirements,
        isPublished: false,
      },
      select: { id: true },
    });

    return { tournamentId: turnamen.id };
  });

  return hasil;
}

export async function daftarUntukAdmin(query: ListSubmissionsQuery): Promise<{
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}> {
  const where: Prisma.TournamentSubmissionWhereInput = query.status
    ? { status: query.status }
    : {};

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.tournamentSubmission.count({ where }),
    prisma.tournamentSubmission.findMany({
      where,
      orderBy: [{ status: "asc" }, { submittedAt: "asc" }],
      skip,
      take: query.limit,
      select: {
        ...PILIHAN_RINGKAS,
        organizerName: true,
        submitter: { select: { name: true, username: true, email: true } },
      },
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}
