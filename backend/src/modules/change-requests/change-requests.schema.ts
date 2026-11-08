import { z } from "zod";

const tanggal = z.coerce.date();
const urlOpsional = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.length === 0 || /^https?:\/\/\S+$/i.test(v), "URL harus diawali http:// atau https://.")
  .optional()
  .or(z.literal(""));

/**
 * Permintaan perubahan informasi turnamen setelah pengajuan disetujui.
 * Hanya field yang benar-benar boleh diubah pengelola yang diterima.
 */
export const changeRequestSchema = z
  .object({
    title: z.string().trim().min(2).max(250).optional(),
    organizerName: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    startDate: tanggal.optional(),
    endDate: tanggal.optional(),
    registrationDeadline: tanggal.nullable().optional(),
    registrationUrl: urlOpsional,
    contact: z.string().trim().max(200).optional().or(z.literal("")),
    format: z.string().trim().max(100).optional().or(z.literal("")),
    teamCount: z.coerce.number().int().min(2).max(512).optional(),
    registrationMethod: z.string().trim().max(100).optional().or(z.literal("")),
    prizePool: z.string().trim().max(200).optional().or(z.literal("")),
    requirements: z.string().trim().max(2000).optional().or(z.literal("")),
    message: z.string().trim().min(10, "Jelaskan alasan perubahan minimal 10 karakter.").max(1000),
  })
  .superRefine((nilai, ctx) => {
    const { message, ...perubahan } = nilai;
    void message;

    const jumlah = Object.values(perubahan).filter((v) => v !== undefined).length;
    if (jumlah === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Isi minimal satu informasi yang ingin diubah.",
      });
    }

    if (nilai.startDate && nilai.endDate && nilai.endDate < nilai.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      });
    }
  });

export const decisionSchema = z
  .object({
    decision: z.enum(["APPROVED", "REJECTED"]),
    note: z.string().trim().max(2000).optional(),
  })
  .superRefine((nilai, ctx) => {
    if (nilai.decision === "REJECTED" && !nilai.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "Catatan wajib diisi saat menolak permintaan.",
      });
    }
  });

export const listQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type ChangeRequestInput = z.infer<typeof changeRequestSchema>;
export type ChangeDecisionInput = z.infer<typeof decisionSchema>;
export type ChangeListQuery = z.infer<typeof listQuerySchema>;
