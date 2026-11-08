import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(100, "Nama maksimal 100 karakter.")
      .optional(),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username minimal 3 karakter.")
      .max(50, "Username maksimal 50 karakter.")
      .regex(/^[a-z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan garis bawah.")
      .optional(),
    bio: z
      .string()
      .trim()
      .max(500, "Bio maksimal 500 karakter.")
      .optional()
      .transform((nilai) => (nilai === undefined ? undefined : nilai)),
    avatarUrl: z
      .string()
      .trim()
      .max(500, "URL avatar maksimal 500 karakter.")
      .optional()
      .refine(
        (nilai) => nilai === undefined || nilai === "" || /^https?:\/\/\S+$/i.test(nilai),
        "URL avatar harus diawali http:// atau https://.",
      ),
  })
  .refine((nilai) => Object.values(nilai).some((v) => v !== undefined), {
    message: "Tidak ada perubahan yang dikirim.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Kata sandi baru minimal 8 karakter.")
      .max(72, "Kata sandi baru maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .superRefine((nilai, ctx) => {
    if (nilai.newPassword !== nilai.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Konfirmasi kata sandi tidak cocok.",
      });
    }

    if (nilai.newPassword === nilai.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Kata sandi baru harus berbeda dari kata sandi saat ini.",
      });
    }
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
