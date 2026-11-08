import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  adminArticleSchema,
  adminArticleUpdateSchema,
  adminGameSchema,
  adminGameUpdateSchema,
  adminListQuerySchema,
  adminUserUpdateSchema,
} from "./admin-management.schema";
import { ringkasanLaporan } from "./reports.service";
import {
  buatArtikel,
  buatGame,
  daftarArtikelAdmin,
  daftarGameAdmin,
  daftarPengguna,
  hapusArtikel,
  hapusGame,
  ringkasanDashboard,
  ubahArtikel,
  ubahGame,
  ubahPengguna,
} from "./admin-management.service";

function adminDari(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

function idDari(req: Request, kunci: string): string {
  const id = req.params[kunci];
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Data tidak ditemukan.");
  }
  return id;
}

async function getGames(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof adminListQuerySchema.parse>;
  const hasil = await daftarGameAdmin(query);
  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function postGame(req: Request, res: Response): Promise<void> {
  const game = await buatGame(req.body);
  sendSuccess(res, { game }, 201);
}

async function patchGame(req: Request, res: Response): Promise<void> {
  const game = await ubahGame(idDari(req, "id"), req.body);
  sendSuccess(res, { game });
}

async function deleteGame(req: Request, res: Response): Promise<void> {
  const hasil = await hapusGame(idDari(req, "id"));
  sendSuccess(res, { message: "Game dihapus.", ...hasil });
}

async function getArticles(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof adminListQuerySchema.parse>;
  const hasil = await daftarArtikelAdmin(query);
  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function postArticle(req: Request, res: Response): Promise<void> {
  const artikel = await buatArtikel(adminDari(req), req.body);
  sendSuccess(res, { article: artikel }, 201);
}

async function patchArticle(req: Request, res: Response): Promise<void> {
  const artikel = await ubahArtikel(idDari(req, "id"), req.body);
  sendSuccess(res, { article: artikel });
}

async function deleteArticle(req: Request, res: Response): Promise<void> {
  const hasil = await hapusArtikel(idDari(req, "id"));
  sendSuccess(res, { message: "Artikel dihapus.", ...hasil });
}

async function getUsers(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof adminListQuerySchema.parse>;
  const hasil = await daftarPengguna(query);
  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function patchUser(req: Request, res: Response): Promise<void> {
  const pengguna = await ubahPengguna(adminDari(req), idDari(req, "id"), req.body);
  sendSuccess(res, { user: pengguna });
}

async function getReports(_req: Request, res: Response): Promise<void> {
  const laporan = await ringkasanLaporan();
  sendSuccess(res, laporan);
}

async function getDashboard(_req: Request, res: Response): Promise<void> {
  const ringkasan = await ringkasanDashboard();
  sendSuccess(res, ringkasan);
}

export const adminManagementRoutes = Router();

adminManagementRoutes.use(authenticate);
adminManagementRoutes.use(authorize("ADMIN"));

adminManagementRoutes.get("/dashboard", getDashboard);
adminManagementRoutes.get("/reports", getReports);

adminManagementRoutes.get("/games", validateQuery(adminListQuerySchema), getGames);
adminManagementRoutes.post("/games", validate(adminGameSchema), postGame);
adminManagementRoutes.patch("/games/:id", validate(adminGameUpdateSchema), patchGame);
adminManagementRoutes.delete("/games/:id", deleteGame);

adminManagementRoutes.get("/articles", validateQuery(adminListQuerySchema), getArticles);
adminManagementRoutes.post("/articles", validate(adminArticleSchema), postArticle);
adminManagementRoutes.patch("/articles/:id", validate(adminArticleUpdateSchema), patchArticle);
adminManagementRoutes.delete("/articles/:id", deleteArticle);

adminManagementRoutes.get("/users", validateQuery(adminListQuerySchema), getUsers);
adminManagementRoutes.patch("/users/:id", validate(adminUserUpdateSchema), patchUser);
