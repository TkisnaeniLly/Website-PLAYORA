import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  daftarFavorit,
  hapusFavorit,
  tambahFavorit,
} from "./favorites.service";

function penggunaDari(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

function gameIdDari(req: Request): string {
  const id = req.params.gameId;
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Game tidak ditemukan.");
  }
  return id;
}

async function getFavorites(req: Request, res: Response): Promise<void> {
  const items = await daftarFavorit(penggunaDari(req));
  sendSuccess(res, { items, total: items.length });
}

async function postFavorite(req: Request, res: Response): Promise<void> {
  const hasil = await tambahFavorit(penggunaDari(req), gameIdDari(req));
  sendSuccess(res, hasil, hasil.dibuatBaru ? 201 : 200);
}

async function deleteFavorite(req: Request, res: Response): Promise<void> {
  const hasil = await hapusFavorit(penggunaDari(req), gameIdDari(req));
  sendSuccess(res, { message: "Game dihapus dari favorit.", ...hasil });
}

export const favoriteRoutes = Router();

favoriteRoutes.use(authenticate);

favoriteRoutes.get("/", getFavorites);
favoriteRoutes.post("/:gameId", postFavorite);
favoriteRoutes.delete("/:gameId", deleteFavorite);
