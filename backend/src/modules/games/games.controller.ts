import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import type { ListGamesQuery } from "./games.schema";
import { daftarGame, detailGame, filterKatalog } from "./games.service";

export async function getGames(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListGamesQuery;
  const hasil = await daftarGame(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

export async function getGameDetail(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug;
  if (typeof slug !== "string" || slug.length === 0) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Game tidak ditemukan." },
    });
    return;
  }

  const game = await detailGame(slug);
  sendSuccess(res, { game });
}

export async function getGameFilters(_req: Request, res: Response): Promise<void> {
  const filters = await filterKatalog();
  sendSuccess(res, filters);
}
