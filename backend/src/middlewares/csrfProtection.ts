import type { NextFunction, Request, Response } from "express";
import { corsOrigins } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { CSRF_COOKIE } from "../utils/cookies";
import { csrfTokensMatch, isCsrfTokenWellFormed } from "../utils/csrf";

export const CSRF_HEADER = "x-csrf-token";

const METODE_AMAN = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Signed double-submit cookie tanpa state di server.
 *
 * Perlindungan berlapis:
 *  1. Origin wajib ada dan termasuk daftar yang diizinkan.
 *  2. Header X-CSRF-Token wajib ada dan nilainya sama dengan cookie.
 *  3. Tanda tangan HMAC pada token diverifikasi dengan CSRF_SECRET,
 *     sehingga penyerang yang mampu menanam cookie tidak bisa memalsukannya.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (METODE_AMAN.has(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (!origin || !corsOrigins.includes(origin)) {
    next(ApiError.forbidden("Permintaan ditolak karena asal permintaan tidak dikenali."));
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get(CSRF_HEADER);

  if (
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    cookieToken.length === 0 ||
    headerToken.length === 0
  ) {
    next(ApiError.forbidden("Permintaan ditolak karena token CSRF tidak ditemukan."));
    return;
  }

  if (!isCsrfTokenWellFormed(cookieToken) || !isCsrfTokenWellFormed(headerToken)) {
    next(ApiError.forbidden("Permintaan ditolak karena token CSRF tidak valid."));
    return;
  }

  if (!csrfTokensMatch(cookieToken, headerToken)) {
    next(ApiError.forbidden("Permintaan ditolak karena token CSRF tidak cocok."));
    return;
  }

  next();
}
