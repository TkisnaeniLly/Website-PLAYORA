import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";
import { AUTH_COOKIE, clearAuthCookie } from "../utils/cookies";
import type { AuthUser } from "../types/auth";

const PILIHAN_USER = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
  isActive: true,
  tokenVersion: true,
} as const;

async function muatPenggunaDariCookie(req: Request, res: Response, wajib: boolean) {
  const token = req.cookies?.[AUTH_COOKIE];

  if (typeof token !== "string" || token.length === 0) {
    return wajib ? { error: ApiError.unauthorized() } : { user: null };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    if (wajib) clearAuthCookie(res);
    return wajib ? { error: ApiError.unauthorized() } : { user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: PILIHAN_USER,
  });

  if (!user || !user.isActive) {
    if (wajib) clearAuthCookie(res);
    return wajib ? { error: ApiError.unauthorized() } : { user: null };
  }

  if (payload.ver !== user.tokenVersion) {
    if (wajib) clearAuthCookie(res);
    return wajib ? { error: ApiError.unauthorized() } : { user: null };
  }

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };

  return { user: authUser };
}

/**
 * Memvalidasi JWT dari cookie, lalu memuat ulang pengguna dari database.
 * Peran TIDAK diambil dari klaim token, sehingga perubahan peran atau
 * penonaktifan akun langsung berlaku tanpa menunggu token kedaluwarsa.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const hasil = await muatPenggunaDariCookie(req, res, true);
  if (!hasil.user) {
    next(hasil.error ?? ApiError.unauthorized());
    return;
  }

  req.user = hasil.user;
  next();
}

/**
 * Versi longgar: bila token valid, `req.user` diisi; bila tidak, permintaan
 * tetap dilanjutkan sebagai tamu. Dipakai endpoint publik yang perlu menandai
 * data milik pengguna (mis. `likedByMe` pada komunitas).
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const hasil = await muatPenggunaDariCookie(req, res, false);
  if (hasil.user) req.user = hasil.user;
  next();
}

/** Membatasi endpoint pada peran tertentu. Harus dipasang setelah `authenticate`. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden());
      return;
    }

    next();
  };
}
