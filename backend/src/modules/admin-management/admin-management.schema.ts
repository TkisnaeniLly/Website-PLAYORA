import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(3, "Slug minimal 3 karakter.")
  .max(270, "Slug maksimal 270 karakter.")
  .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.");

const urlOpsional = z
  .string()
  .trim()
  .max(500, "URL maksimal 500 karakter.")
  .refine(
    (nilai) => nilai.length === 0 || /^https?:\/\/\S+$/i.test(nilai),
    "URL harus diawali http:// atau https://.",
  )
  .optional()
  .or(z.literal(""));

export const adminGameSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter.").max(200),
  slug,
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter.").max(5000),
  genre: z.string().trim().min(2, "Genre minimal 2 karakter.").max(100),
  developer: z.string().trim().max(150).optional(),
  publisher: z.string().trim().max(150).optional(),
  releaseDate: z.coerce.date().optional(),
  coverImageUrl: urlOpsional,
  isPopular: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  platformIds: z.array(z.string()).max(10).optional(),
});

export const adminGameUpdateSchema = adminGameSchema.partial().refine(
  (nilai) => Object.keys(nilai).length > 0,
  { message: "Tidak ada perubahan yang dikirim." },
);

export const adminArticleSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter.").max(250),
  slug,
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().min(20, "Isi artikel minimal 20 karakter."),
  category: z.enum(["NEWS", "UPDATE", "TIPS", "TUTORIAL", "ESPORTS"]),
  gameId: z.string().uuid().nullable().optional(),
  thumbnailUrl: urlOpsional,
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const adminArticleUpdateSchema = adminArticleSchema
  .partial()
  .refine((nilai) => Object.keys(nilai).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export const adminUserUpdateSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((nilai) => nilai.role !== undefined || nilai.isActive !== undefined, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export const adminListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type AdminGameInput = z.infer<typeof adminGameSchema>;
export type AdminGameUpdateInput = z.infer<typeof adminGameUpdateSchema>;
export type AdminArticleInput = z.infer<typeof adminArticleSchema>;
export type AdminArticleUpdateInput = z.infer<typeof adminArticleUpdateSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
