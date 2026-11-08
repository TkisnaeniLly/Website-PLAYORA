import { z } from "zod";

// Bcrypt hanya memproses 72 byte pertama; batas ini ditegakkan agar tidak ada
// karakter yang diam-diam terabaikan.
const kataSandi = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter.")
    .max(50, "Username maksimal 50 karakter.")
    .regex(/^[a-z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan garis bawah."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid.")
    .max(255, "Email maksimal 255 karakter."),
  password: kataSandi,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
