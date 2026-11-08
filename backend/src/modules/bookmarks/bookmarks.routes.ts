import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  daftarSimpanan,
  hapusSimpanan,
  tambahSimpanan,
} from "./bookmarks.service";

function penggunaDari(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

function artikelIdDari(req: Request): string {
  const id = req.params.articleId;
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Artikel tidak ditemukan.");
  }
  return id;
}

async function getBookmarks(req: Request, res: Response): Promise<void> {
  const items = await daftarSimpanan(penggunaDari(req));
  sendSuccess(res, { items, total: items.length });
}

async function postBookmark(req: Request, res: Response): Promise<void> {
  const hasil = await tambahSimpanan(penggunaDari(req), artikelIdDari(req));
  sendSuccess(res, hasil, hasil.dibuatBaru ? 201 : 200);
}

async function deleteBookmark(req: Request, res: Response): Promise<void> {
  const hasil = await hapusSimpanan(penggunaDari(req), artikelIdDari(req));
  sendSuccess(res, { message: "Artikel dihapus dari simpanan.", ...hasil });
}

export const bookmarkRoutes = Router();

bookmarkRoutes.use(authenticate);

bookmarkRoutes.get("/", getBookmarks);
bookmarkRoutes.post("/:articleId", postBookmark);
bookmarkRoutes.delete("/:articleId", deleteBookmark);
