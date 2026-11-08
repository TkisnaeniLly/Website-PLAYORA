import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import type {
  AdminDiscordRoomListQuery,
  DiscordRoomInput,
  DiscordRoomListQuery,
  DiscordRoomReviewInput,
  DiscordRoomUpdateInput,
} from "./discord-rooms.schema";

const PILIHAN_PUBLIK = {
  id: true,
  name: true,
  inviteUrl: true,
  description: true,
  memberCount: true,
  createdAt: true,
  game: { select: { id: true, title: true, slug: true } },
} as const;

const PILIHAN_MILIK = {
  id: true,
  name: true,
  inviteUrl: true,
  description: true,
  memberCount: true,
  status: true,
  adminNote: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  game: { select: { id: true, title: true, slug: true } },
} as const;

const PILIHAN_ADMIN = {
  ...PILIHAN_MILIK,
  submitter: { select: { id: true, name: true, username: true } },
  reviewer: { select: { name: true, username: true } },
} as const;

async function pastikanGameAda(gameId: string | undefined): Promise<void> {
  if (!gameId) return;

  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } });
  if (!game) throw ApiError.badRequest("Game yang dipilih tidak ditemukan.");
}

async function pastikanUndanganBelumDipakai(inviteUrl: string, kecualiId?: string): Promise<void> {
  const ada = await prisma.discordRoom.findUnique({
    where: { inviteUrl },
    select: { id: true },
  });

  if (ada && ada.id !== kecualiId) {
    throw ApiError.conflict(
      "Tautan undangan ini sudah terdaftar. Gunakan tautan undangan lain atau perbarui pengajuan sebelumnya.",
    );
  }
}

/** Rekomendasi ruang Discord untuk anggota: hanya yang sudah disetujui admin. */
export async function daftarRuangRekomendasi(query: DiscordRoomListQuery) {
  const where: Prisma.DiscordRoomWhereInput = {
    status: "APPROVED",
    ...(query.gameId ? { gameId: query.gameId } : {}),
    ...(query.q
      ? {
          OR: [{ name: { contains: query.q } }, { description: { contains: query.q } }],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.discordRoom.count({ where }),
    prisma.discordRoom.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: query.limit,
      select: PILIHAN_PUBLIK,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function daftarRuangMilik(userId: string) {
  return prisma.discordRoom.findMany({
    where: { submittedBy: userId },
    orderBy: { createdAt: "desc" },
    select: PILIHAN_MILIK,
  });
}

export async function ajukanRuang(user: AuthUser, input: DiscordRoomInput) {
  await pastikanGameAda(input.gameId);
  await pastikanUndanganBelumDipakai(input.inviteUrl);

  return prisma.discordRoom.create({
    data: {
      submittedBy: user.id,
      name: input.name,
      inviteUrl: input.inviteUrl,
      description: input.description,
      gameId: input.gameId ?? null,
      memberCount: input.memberCount ?? null,
    },
    select: PILIHAN_MILIK,
  });
}

/**
 * Pemilik dapat memperbaiki pengajuannya. Setiap perubahan mengembalikan status
 * ke PENDING agar ruang yang sudah tampil publik ditinjau ulang sebelum tayang lagi.
 */
export async function ubahRuang(user: AuthUser, id: string, input: DiscordRoomUpdateInput) {
  const ruang = await prisma.discordRoom.findUnique({
    where: { id },
    select: { id: true, submittedBy: true, inviteUrl: true },
  });

  if (!ruang || ruang.submittedBy !== user.id) {
    throw ApiError.notFound("Ruang Discord tidak ditemukan.");
  }

  await pastikanGameAda(input.gameId);
  if (input.inviteUrl) {
    await pastikanUndanganBelumDipakai(input.inviteUrl, id);
  }

  return prisma.discordRoom.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.inviteUrl !== undefined ? { inviteUrl: input.inviteUrl } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.gameId !== undefined ? { gameId: input.gameId } : {}),
      ...(input.memberCount !== undefined ? { memberCount: input.memberCount } : {}),
      status: "PENDING",
      adminNote: null,
      reviewedBy: null,
      reviewedAt: null,
    },
    select: PILIHAN_MILIK,
  });
}

export async function daftarAntreanAdmin(query: AdminDiscordRoomListQuery) {
  const where: Prisma.DiscordRoomWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.gameId ? { gameId: query.gameId } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q } },
            { description: { contains: query.q } },
            { submitter: { is: { username: { contains: query.q } } } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.discordRoom.count({ where }),
    prisma.discordRoom.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take: query.limit,
      select: PILIHAN_ADMIN,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function putuskanRuang(admin: AuthUser, id: string, input: DiscordRoomReviewInput) {
  const ruang = await prisma.discordRoom.findUnique({
    where: { id },
    select: { id: true, name: true, status: true, submittedBy: true },
  });

  if (!ruang) throw ApiError.notFound("Ruang Discord tidak ditemukan.");

  if (ruang.status !== "PENDING") {
    throw ApiError.conflict("Ruang Discord ini sudah diputuskan.");
  }

  await prisma.$transaction([
    prisma.discordRoom.update({
      where: { id },
      data: {
        status: input.decision,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        adminNote: input.note ?? null,
      },
    }),
    prisma.notification.create({
      data: {
        userId: ruang.submittedBy,
        type: input.decision === "APPROVED" ? "DISCORD_ROOM_APPROVED" : "DISCORD_ROOM_REJECTED",
        title:
          input.decision === "APPROVED"
            ? "Ruang Discord disetujui"
            : "Ruang Discord ditolak",
        message:
          input.decision === "APPROVED"
            ? `Ruang Discord "${ruang.name}" telah disetujui dan kini tampil di rekomendasi komunitas.`
            : `Ruang Discord "${ruang.name}" ditolak. ${input.note ?? ""}`
                .replace(/\s+/g, " ")
                .trim(),
        referenceId: ruang.id,
      },
    }),
  ]);

  return { id, status: input.decision };
}
