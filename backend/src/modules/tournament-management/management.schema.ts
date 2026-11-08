import { z } from "zod";

const entriHasil = z.object({
  position: z.coerce
    .number()
    .int("Peringkat harus bilangan bulat.")
    .min(1, "Peringkat minimal 1.")
    .max(64, "Peringkat maksimal 64."),
  teamOrPlayer: z
    .string()
    .trim()
    .min(2, "Nama tim/pemain minimal 2 karakter.")
    .max(150, "Nama tim/pemain maksimal 150 karakter."),
  note: z
    .string()
    .trim()
    .max(300, "Catatan maksimal 300 karakter.")
    .optional()
    .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined)),
});

export const submitResultsSchema = z
  .object({
    results: z
      .array(entriHasil)
      .min(1, "Isi minimal satu hasil.")
      .max(64, "Maksimal 64 hasil."),
  })
  .superRefine((nilai, ctx) => {
    const posisi = nilai.results.map((r) => r.position);
    if (new Set(posisi).size !== posisi.length) {
      ctx.addIssue({
        code: "custom",
        path: ["results"],
        message: "Peringkat tidak boleh ganda.",
      });
    }
  });

export const reviewResultsSchema = z
  .object({
    decision: z.enum(["APPROVED", "REJECTED"]),
    note: z
      .string()
      .trim()
      .max(2000, "Catatan maksimal 2000 karakter.")
      .optional()
      .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined)),
  })
  .superRefine((nilai, ctx) => {
    if (nilai.decision === "REJECTED" && !nilai.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "Catatan wajib diisi saat menolak hasil.",
      });
    }
  });

export const reviewSingleResultSchema = reviewResultsSchema;

export const publishSchema = z.object({
  isPublished: z.boolean(),
});

export const adminTournamentsQuerySchema = z.object({
  status: z
    .enum(["published", "unpublished", "awaiting_results"])
    .optional()
    .transform((nilai) => nilai ?? undefined),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type SubmitResultsInput = z.infer<typeof submitResultsSchema>;
export type ReviewResultsInput = z.infer<typeof reviewResultsSchema>;
export type AdminTournamentsQuery = z.infer<typeof adminTournamentsQuerySchema>;