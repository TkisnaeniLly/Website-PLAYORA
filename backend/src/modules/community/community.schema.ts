import { z } from "zod";

export const postSchema = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter.").max(200),
  body: z.string().trim().min(10, "Isi postingan minimal 10 karakter.").max(5000),
  category: z.enum(["DISKUSI", "TIPS", "TURNAMEN", "REKOMENDASI", "EVENT"]).default("DISKUSI"),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v.length === 0 || /^https?:\/\/\S+$/i.test(v), "URL gambar harus diawali http:// atau https://.")
    .optional()
    .or(z.literal("")),
});

export const commentSchema = z.object({
  body: z.string().trim().min(2, "Komentar minimal 2 karakter.").max(1000),
});

export const hideSchema = z.object({
  isHidden: z.boolean(),
});

export const communityListQuerySchema = z.object({
  category: z.enum(["DISKUSI", "TIPS", "TURNAMEN", "REKOMENDASI", "EVENT"]).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["terbaru", "populer"]).default("terbaru"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(10),
});

export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CommunityListQuery = z.infer<typeof communityListQuerySchema>;
