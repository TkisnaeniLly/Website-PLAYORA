import { z } from "zod";

/**
 * Tautan undangan Discord yang diterima:
 *   https://discord.gg/<kode>
 *   https://discord.com/invite/<kode>
 * Kode undangan bersifat peka huruf besar/kecil, jadi tidak diubah.
 */
const POLA_UNDANGAN = /^https:\/\/(?:discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]{2,}\/?$/i;

/** Menormalkan tautan agar duplikat dengan variasi host/garis miring tetap terdeteksi. */
export function rapikanUndanganDiscord(nilai: string): string {
  const url = new URL(nilai);
  const host = url.hostname.toLowerCase();
  const jalur = url.pathname.replace(/\/+$/, "");
  return `https://${host}${jalur}`;
}

const undangan = z
  .string()
  .trim()
  .max(500, "Tautan undangan maksimal 500 karakter.")
  .refine(
    (nilai) => POLA_UNDANGAN.test(nilai),
    "Tautan harus berupa undangan Discord: https://discord.gg/... atau https://discord.com/invite/...",
  )
  .transform(rapikanUndanganDiscord);

const jumlahAnggota = z.preprocess(
  (nilai) => (nilai === "" || nilai === null ? undefined : nilai),
  z.coerce
    .number()
    .int("Jumlah anggota harus bilangan bulat.")
    .min(0)
    .max(10_000_000)
    .optional(),
);

export const discordRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama ruang minimal 3 karakter.")
    .max(150, "Nama ruang maksimal 150 karakter."),
  inviteUrl: undangan,
  description: z
    .string()
    .trim()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
  gameId: z.string().uuid("Game tidak valid.").optional(),
  memberCount: jumlahAnggota,
});

export const discordRoomUpdateSchema = discordRoomSchema
  .partial()
  .refine((nilai) => Object.keys(nilai).length > 0, {
    message: "Isi minimal satu data yang ingin diubah.",
  });

export const discordRoomReviewSchema = z
  .object({
    decision: z.enum(["APPROVED", "REJECTED"]),
    note: z.string().trim().max(1000, "Catatan maksimal 1000 karakter.").optional(),
  })
  .superRefine((nilai, ctx) => {
    if (nilai.decision === "REJECTED" && !nilai.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "Catatan wajib diisi saat menolak ruang Discord.",
      });
    }
  });

export const discordRoomListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  gameId: z.string().uuid("Game tidak valid.").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const adminDiscordRoomListQuerySchema = discordRoomListQuerySchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export type DiscordRoomInput = z.infer<typeof discordRoomSchema>;
export type DiscordRoomUpdateInput = z.infer<typeof discordRoomUpdateSchema>;
export type DiscordRoomReviewInput = z.infer<typeof discordRoomReviewSchema>;
export type DiscordRoomListQuery = z.infer<typeof discordRoomListQuerySchema>;
export type AdminDiscordRoomListQuery = z.infer<typeof adminDiscordRoomListQuerySchema>;
