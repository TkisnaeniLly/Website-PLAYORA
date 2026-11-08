import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import type { ListTournamentsQuery } from "./tournaments.schema";
import { daftarTurnamen, detailTurnamen } from "./tournaments.service";

export async function getTournaments(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListTournamentsQuery;
  const hasil = await daftarTurnamen(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

export async function getTournamentDetail(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug;

  if (typeof slug !== "string" || slug.length === 0) {
    throw ApiError.notFound("Turnamen tidak ditemukan.");
  }

  const turnamen = await detailTurnamen(slug, req.user);
  sendSuccess(res, { tournament: turnamen });
}
