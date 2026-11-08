import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Berkas .env berada di root `backend/`. Baik dijalankan dari `src/` (tsx)
// maupun dari `dist/` (build), path di bawah tetap menunjuk ke berkas yang sama.
// Saat NODE_ENV=test, berkas ini TIDAK dimuat agar konfigurasi pengujian
// (.env.test) tidak tertimpa oleh konfigurasi pengembangan — khususnya DATABASE_URL.
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL wajib diisi (contoh: mysql://root@localhost:3306/playora_db)"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  CSRF_SECRET: z.string().min(32, "CSRF_SECRET minimal 32 karakter"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_LOGIN_IP_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_REGISTER_MAX: z.coerce.number().int().positive().default(5),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const rincian = parsed.error.issues
    .map((issue) => {
      const lokasi = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  - ${lokasi}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(
    `Konfigurasi environment tidak valid. Periksa berkas backend/.env\n${rincian}`,
  );
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

/** Daftar origin frontend yang diizinkan mengakses API. */
export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
} as const;

// Harus dapat dibaca JavaScript: frontend menyalin nilainya ke header X-CSRF-Token.
// Karena itu httpOnly sengaja false — ini syarat protokol double-submit, bukan kelalaian.
export const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
} as const;

// Menerima format JWT_EXPIRES_IN: 45s, 30m, 12h, 7d.
export function parseDurationToMs(nilai: string): number {
  const cocok = /^(\d+)\s*(s|m|h|d)$/i.exec(nilai.trim());
  if (!cocok) return 7 * 24 * 60 * 60 * 1000;

  const jumlah = Number(cocok[1]);
  const satuan = (cocok[2] ?? "d").toLowerCase();
  const faktor: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return jumlah * (faktor[satuan] ?? 86_400_000);
}
