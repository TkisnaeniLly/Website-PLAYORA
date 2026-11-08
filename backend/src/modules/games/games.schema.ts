import { z } from "zod";

const teksOpsional = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks)
    .optional()
    .transform((nilai) => (nilai && nilai.length > 0 ? nilai : undefined));

export const listGamesQuerySchema = z.object({
  q: teksOpsional(100),
  platform: teksOpsional(50),
  genre: teksOpsional(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;
