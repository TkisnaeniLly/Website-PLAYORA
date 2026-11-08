import { z } from "zod";

const tanggalISO = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.")
  .transform((nilai) => new Date(`${nilai}T00:00:00.000Z`))
  .refine((nilai) => !Number.isNaN(nilai.getTime()), "Tanggal tidak valid.");

const tanggalOpsional = z
  .string()
  .trim()
  .optional()
  .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined))
  .pipe(tanggalISO.optional());

const teksOpsional = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks)
    .optional()
    .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined));

const urlOpsional = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined))
  .refine(
    (nilai) => nilai === undefined || /^https?:\/\/\S+$/i.test(nilai),
    "Tautan harus diawali http:// atau https://.",
  );

const bodyPengajuan = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Judul turnamen minimal 5 karakter.")
    .max(250, "Judul turnamen maksimal 250 karakter."),
  gameId: z.string().trim().uuid("Game yang dipilih tidak valid."),
  organizerName: z
    .string()
    .trim()
    .min(3, "Nama penyelenggara minimal 3 karakter.")
    .max(150, "Nama penyelenggara maksimal 150 karakter."),
  description: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter.")
    .max(5000, "Deskripsi maksimal 5000 karakter."),
  startDate: tanggalISO,
  endDate: tanggalISO,
  registrationDeadline: tanggalOpsional,
  format: z
    .string()
    .trim()
    .min(3, "Format turnamen minimal 3 karakter.")
    .max(100, "Format turnamen maksimal 100 karakter."),
  teamCount: z.coerce
    .number()
    .int("Jumlah tim harus bilangan bulat.")
    .min(2, "Jumlah tim minimal 2.")
    .max(512, "Jumlah tim maksimal 512."),
  prizePool: teksOpsional(200),
  requirements: teksOpsional(5000),
  registrationMethod: z
    .string()
    .trim()
    .min(3, "Metode pendaftaran minimal 3 karakter.")
    .max(100, "Metode pendaftaran maksimal 100 karakter."),
  registrationUrl: urlOpsional,
  contact: teksOpsional(200),
});

function validasiLogika(
  nilai: {
    startDate: Date;
    endDate: Date;
    registrationDeadline?: Date | undefined;
    registrationUrl?: string | undefined;
    contact?: string | undefined;
  },
  ctx: z.RefinementCtx,
): void {
  if (nilai.endDate < nilai.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
    });
  }

  if (nilai.registrationDeadline && nilai.registrationDeadline > nilai.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["registrationDeadline"],
      message: "Batas pendaftaran tidak boleh setelah tanggal mulai.",
    });
  }

  const hariIni = new Date();
  const awalHariIni = new Date(
    Date.UTC(hariIni.getUTCFullYear(), hariIni.getUTCMonth(), hariIni.getUTCDate()),
  );

  if (nilai.endDate < awalHariIni) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Turnamen yang sudah selesai tidak dapat diajukan.",
    });
  }

  if (!nilai.registrationUrl && !nilai.contact) {
    ctx.addIssue({
      code: "custom",
      path: ["registrationUrl"],
      message: "Isi minimal salah satu: tautan pendaftaran atau kontak penyelenggara.",
    });
  }
}

export const createSubmissionSchema = bodyPengajuan.superRefine(validasiLogika);

export const updateSubmissionSchema = bodyPengajuan
  .partial()
  .superRefine((nilai, ctx) => {
    if (nilai.startDate && nilai.endDate) {
      validasiLogika(
        {
          startDate: nilai.startDate,
          endDate: nilai.endDate,
          registrationDeadline: nilai.registrationDeadline,
          registrationUrl: nilai.registrationUrl,
          contact: nilai.contact,
        },
        ctx,
      );
    }
  });

export const listSubmissionsQuerySchema = z.object({
  status: z
    .enum(["PENDING", "NEEDS_REVISION", "APPROVED", "REJECTED"])
    .optional()
    .transform((nilai) => nilai ?? undefined),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const decisionSchema = z
  .object({
    decision: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
    note: z
      .string()
      .trim()
      .max(2000, "Catatan maksimal 2000 karakter.")
      .optional()
      .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined)),
  })
  .superRefine((nilai, ctx) => {
    if (nilai.decision !== "APPROVED" && !nilai.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "Catatan wajib diisi untuk penolakan atau permintaan revisi.",
      });
    }
  });

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
