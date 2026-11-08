import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import type { ChangePasswordInput, UpdateProfileInput } from "./profile.schema";

const PILIHAN_PROFIL = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
} as const;

export async function perbaruiProfil(userId: string, input: UpdateProfileInput) {
  if (input.username) {
    const bentrok = await prisma.user.findFirst({
      where: { username: input.username, id: { not: userId } },
      select: { id: true },
    });

    if (bentrok) {
      throw ApiError.conflict("Username sudah digunakan.");
    }
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.bio !== undefined ? { bio: input.bio === "" ? null : input.bio } : {}),
        ...(input.avatarUrl !== undefined
          ? { avatarUrl: input.avatarUrl === "" ? null : input.avatarUrl }
          : {}),
      },
      select: PILIHAN_PROFIL,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw ApiError.conflict("Username sudah digunakan.");
    }
    throw error;
  }
}

/**
 * Mengganti kata sandi lalu menaikkan `token_version`.
 *
 * Semua token yang beredar sebelumnya otomatis ditolak. Versi terbaru
 * dikembalikan agar pemanggil dapat menerbitkan ulang cookie untuk perangkat
 * ini, sehingga pengguna tidak terlempar keluar dari sesinya sendiri.
 */
export async function gantiKataSandi(
  userId: string,
  input: ChangePasswordInput,
): Promise<{ tokenVersion: number }> {
  const pengguna = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true, tokenVersion: true, isActive: true },
  });

  if (!pengguna || !pengguna.isActive) {
    throw ApiError.unauthorized();
  }

  const cocok = await bcrypt.compare(input.currentPassword, pengguna.passwordHash);
  if (!cocok) {
    throw ApiError.badRequest("Kata sandi saat ini tidak sesuai.", [
      { field: "currentPassword", message: "Kata sandi saat ini tidak sesuai." },
    ]);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);

  const diperbarui = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });

  return { tokenVersion: diperbarui.tokenVersion };
}

export async function ambilProfil(userId: string) {
  const pengguna = await prisma.user.findUnique({
    where: { id: userId },
    select: PILIHAN_PROFIL,
  });

  if (!pengguna) {
    throw ApiError.notFound("Pengguna tidak ditemukan.");
  }

  return pengguna;
}
