import { z } from "zod";
import { SEMUA_STATUS } from "./tournaments.constants";

export const listTournamentsQuerySchema = z.object({
  status: z
    .enum(SEMUA_STATUS as [string, ...string[]])
    .optional()
    .transform((nilai) => nilai ?? undefined),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type ListTournamentsQuery = z.infer<typeof listTournamentsQuerySchema>;
