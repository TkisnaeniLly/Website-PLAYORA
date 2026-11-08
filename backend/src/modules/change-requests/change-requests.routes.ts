import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  changeRequestSchema,
  decisionSchema,
  listQuerySchema,
} from "./change-requests.schema";
import {
  ajukanPerubahan,
  daftarAntreanAdmin,
  daftarPerubahan,
  putuskanPerubahan,
} from "./change-requests.service";

function penggunaDari(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

function idDari(req: Request, kunci: string, pesan: string): string {
  const id = req.params[kunci];
  if (typeof id !== "string" || id.length === 0) throw ApiError.notFound(pesan);
  return id;
}

async function getChangeRequests(req: Request, res: Response): Promise<void> {
  const items = await daftarPerubahan(
    penggunaDari(req),
    idDari(req, "id", "Turnamen tidak ditemukan."),
  );
  sendSuccess(res, { items, total: items.length });
}

async function postChangeRequest(req: Request, res: Response): Promise<void> {
  const hasil = await ajukanPerubahan(
    penggunaDari(req),
    idDari(req, "id", "Turnamen tidak ditemukan."),
    req.body,
  );
  sendSuccess(res, { request: hasil }, 201);
}

export const changeRequestRoutes = Router();

changeRequestRoutes.use(authenticate);
changeRequestRoutes.get("/:id/change-requests", getChangeRequests);
changeRequestRoutes.post(
  "/:id/change-requests",
  validate(changeRequestSchema),
  postChangeRequest,
);

async function getAdminChangeRequests(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof listQuerySchema.parse>;
  const hasil = await daftarAntreanAdmin(query);
  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function patchAdminDecision(req: Request, res: Response): Promise<void> {
  const hasil = await putuskanPerubahan(
    penggunaDari(req),
    idDari(req, "id", "Permintaan perubahan tidak ditemukan."),
    req.body,
  );
  sendSuccess(res, { message: "Keputusan permintaan perubahan tersimpan.", ...hasil });
}

export const adminChangeRequestRoutes = Router();

adminChangeRequestRoutes.use(authenticate);
adminChangeRequestRoutes.use(authorize("ADMIN"));

adminChangeRequestRoutes.get(
  "/",
  validateQuery(listQuerySchema),
  getAdminChangeRequests,
);
adminChangeRequestRoutes.patch("/:id/decision", validate(decisionSchema), patchAdminDecision);
