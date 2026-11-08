import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  adminDiscordRoomListQuerySchema,
  discordRoomListQuerySchema,
  discordRoomReviewSchema,
  discordRoomSchema,
  discordRoomUpdateSchema,
} from "./discord-rooms.schema";
import {
  ajukanRuang,
  daftarAntreanAdmin,
  daftarRuangMilik,
  daftarRuangRekomendasi,
  putuskanRuang,
  ubahRuang,
} from "./discord-rooms.service";

function penggunaDari(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

function idDari(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Ruang Discord tidak ditemukan.");
  }
  return id;
}

async function getRecommendedRooms(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof discordRoomListQuerySchema.parse>;
  const hasil = await daftarRuangRekomendasi(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function getMyRooms(req: Request, res: Response): Promise<void> {
  const items = await daftarRuangMilik(penggunaDari(req).id);
  sendSuccess(res, { items });
}

async function postRoom(req: Request, res: Response): Promise<void> {
  const room = await ajukanRuang(penggunaDari(req), req.body);
  sendSuccess(res, { room }, 201);
}

async function patchRoom(req: Request, res: Response): Promise<void> {
  const room = await ubahRuang(penggunaDari(req), idDari(req), req.body);
  sendSuccess(res, { room });
}

export const discordRoomRoutes = Router();

discordRoomRoutes.get(
  "/",
  authenticate,
  validateQuery(discordRoomListQuerySchema),
  getRecommendedRooms,
);
discordRoomRoutes.get("/mine", authenticate, getMyRooms);
discordRoomRoutes.post("/", authenticate, validate(discordRoomSchema), postRoom);
discordRoomRoutes.patch("/:id", authenticate, validate(discordRoomUpdateSchema), patchRoom);

async function getAdminRooms(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof adminDiscordRoomListQuerySchema.parse>;
  const hasil = await daftarAntreanAdmin(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function patchReview(req: Request, res: Response): Promise<void> {
  const hasil = await putuskanRuang(penggunaDari(req), idDari(req), req.body);
  sendSuccess(res, {
    message: "Keputusan validasi ruang Discord tersimpan.",
    ...hasil,
  });
}

export const adminDiscordRoomRoutes = Router();

adminDiscordRoomRoutes.use(authenticate);
adminDiscordRoomRoutes.use(authorize("ADMIN"));
adminDiscordRoomRoutes.get("/", validateQuery(adminDiscordRoomListQuerySchema), getAdminRooms);
adminDiscordRoomRoutes.patch("/:id/review", validate(discordRoomReviewSchema), patchReview);
