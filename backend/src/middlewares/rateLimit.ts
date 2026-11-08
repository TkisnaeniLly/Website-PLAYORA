import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import { env } from "../config/env";

const PESAN_LOGIN = "Terlalu banyak percobaan masuk. Coba lagi nanti.";
const PESAN_REGISTER = "Terlalu banyak pendaftaran dari alamat ini. Coba lagi nanti.";

function batas(max: number, pesan: string, keyGenerator?: (req: Request) => string) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    ...(keyGenerator ? { keyGenerator } : {}),
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: { code: "RATE_LIMITED", message: pesan },
      });
    },
  });
}

/**
 * Lapisan 1 — per IP + email.
 * Membatasi tebakan password pada satu akun tanpa mengunci akun orang lain
 * hanya karena alamat email korban ditembak berulang kali.
 */
export const loginPerAkunRateLimiter = batas(
  env.RATE_LIMIT_LOGIN_MAX,
  PESAN_LOGIN,
  (req) => {
    const email =
      typeof req.body === "object" &&
      req.body !== null &&
      typeof (req.body as { email?: unknown }).email === "string"
        ? String((req.body as { email: string }).email).trim().toLowerCase()
        : "tanpa-email";
    return `${ipKeyGenerator(req.ip ?? "")}:${email}`;
  },
);

/**
 * Lapisan 2 — per IP.
 * Menahan credential spraying: satu kata sandi dicoba ke banyak akun.
 */
export const loginPerIpRateLimiter = batas(env.RATE_LIMIT_LOGIN_IP_MAX, PESAN_LOGIN);

export const registerRateLimiter = batas(env.RATE_LIMIT_REGISTER_MAX, PESAN_REGISTER);
