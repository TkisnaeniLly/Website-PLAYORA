import { z } from "zod";
import { SEMUA_KATEGORI, kategoriUntukTipe } from "./articles.constants";

const teksOpsional = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks)
    .optional()
    .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined));

const tipeSchema = z
  .enum(["berita", "panduan"])
  .optional()
  .transform((nilai) => nilai ?? undefined);

const kategoriSchema = z
  .enum(SEMUA_KATEGORI)
  .optional()
  .transform((nilai) => nilai ?? undefined);

export const listArticlesQuerySchema = z
  .object({
    q: teksOpsional(150),
    type: tipeSchema,
    category: kategoriSchema,
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
  })
  .superRefine((nilai, ctx) => {
    if (nilai.type && nilai.category) {
      const diizinkan = kategoriUntukTipe(nilai.type);
      if (!(diizinkan as readonly string[]).includes(nilai.category)) {
        ctx.addIssue({
          code: "custom",
          path: ["category"],
          message: `Kategori ${nilai.category} tidak termasuk dalam tipe ${nilai.type}.`,
        });
      }
    }
  });

export const articleDetailQuerySchema = z.object({
  type: tipeSchema,
});

export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
