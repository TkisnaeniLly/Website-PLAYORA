import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import type { LoginInput, RegisterInput } from "./auth.schema";

export interface AuthSession {
  user: AuthUser;
  tokenVersion: number;
}

const PILIHAN_PENGGUNA = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
} as const;

// Hash tiruan agar percobaan login dengan email tak terdaftar tetap menjalankan
// bcrypt.compare, sehingga waktu respons tidak membocorkan keberadaan akun.
const HASH_TIRUAN = bcrypt.hashSync("playora-penyetara-waktu", 10);

const PESAN_KREDENSIAL_SALAH = "Email atau kata sandi salah.";

function adalahPelanggaranUnik(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export async function daftarAkun(input: RegisterInput): Promise<AuthSession> {
  const sudahAda = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { id: true },
  });

  if (sudahAda) {
    throw ApiError.conflict("Email atau username sudah digunakan.");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  try {
    const pengguna = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        passwordHash,
        role: "USER",
      },
      select: { ...PILIHAN_PENGGUNA, tokenVersion: true },
    });

    const { tokenVersion, ...user } = pengguna;
    return { user, tokenVersion };
  } catch (error) {
    // Menangani balapan dua pendaftaran bersamaan pada email/username yang sama.
    if (adalahPelanggaranUnik(error)) {
      throw ApiError.conflict("Email atau username sudah digunakan.");
    }
    throw error;
  }
}

export async function masukAkun(input: LoginInput): Promise<AuthSession> {
  const pengguna = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...PILIHAN_PENGGUNA,
      passwordHash: true,
      isActive: true,
      tokenVersion: true,
    },
  });

  if (!pengguna) {
    await bcrypt.compare(input.password, HASH_TIRUAN);
    throw ApiError.unauthorized(PESAN_KREDENSIAL_SALAH);
  }

  const cocok = await bcrypt.compare(input.password, pengguna.passwordHash);
  if (!cocok) {
    throw ApiError.unauthorized(PESAN_KREDENSIAL_SALAH);
  }

  // Akun nonaktif dibalas dengan pesan yang sama seperti kredensial salah,
  // agar status akun tidak dapat dienumerasi dari luar.
  if (!pengguna.isActive) {
    throw ApiError.unauthorized(PESAN_KREDENSIAL_SALAH);
  }

  const { passwordHash: _hash, isActive: _aktif, tokenVersion, ...user } = pengguna;
  return { user, tokenVersion };
}

/**
 * Menaikkan token_version sehingga seluruh JWT yang beredar untuk pengguna ini
 * langsung ditolak. Dipakai saat ganti kata sandi atau "keluar dari semua perangkat".
 */
export async function cabutSemuaSesi(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}
