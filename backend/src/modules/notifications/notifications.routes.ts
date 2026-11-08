import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/authenticate";
import { validateQuery } from "../../middlewares/validate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  daftarNotifikasi,
  hitungBelumDibaca,
  tandaiDibaca,
  tandaiSemuaDibaca,
} from "./notifications.service";

const listQuerySchema = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((nilai) => nilai === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(20),
});

async function getNotifications(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) throw ApiError.unauthorized();

  const query = res.locals.query as z.infer<typeof listQuerySchema>;
  const hasil = await daftarNotifikasi(pengguna.id, query);

  sendSuccess(res, { items: hasil.items, unreadCount: hasil.unreadCount }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) throw ApiError.unauthorized();

  const jumlah = await hitungBelumDibaca(pengguna.id);
  sendSuccess(res, { unreadCount: jumlah });
}

async function patchRead(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) throw ApiError.unauthorized();

  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Notifikasi tidak ditemukan.");
  }

  await tandaiDibaca(pengguna.id, id);
  sendSuccess(res, { message: "Notifikasi ditandai sudah dibaca." });
}

async function patchReadAll(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) throw ApiError.unauthorized();

  const jumlah = await tandaiSemuaDibaca(pengguna.id);
  sendSuccess(res, { message: "Semua notifikasi ditandai sudah dibaca.", jumlah });
}

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);

notificationRoutes.get("/", validateQuery(listQuerySchema), getNotifications);
notificationRoutes.get("/unread-count", getUnreadCount);
notificationRoutes.patch("/read-all", patchReadAll);
notificationRoutes.patch("/:id/read", patchRead);
