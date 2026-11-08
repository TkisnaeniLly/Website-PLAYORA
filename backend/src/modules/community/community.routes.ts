import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, authorize, optionalAuthenticate } from "../../middlewares/authenticate";
import { validate, validateQuery } from "../../middlewares/validate";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import {
  commentSchema,
  communityListQuerySchema,
  hideSchema,
  postSchema,
} from "./community.schema";
import {
  aturSembunyi,
  buatPost,
  daftarPost,
  daftarPostUntukAdmin,
  detailPost,
  hapusKomentar,
  hapusPost,
  tambahKomentar,
  toggleLike,
  ubahPost,
} from "./community.service";

function penggunaDari(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

function idDari(req: Request, kunci: string, pesan: string): string {
  const id = req.params[kunci];
  if (typeof id !== "string" || id.length === 0) throw ApiError.notFound(pesan);
  return id;
}

async function getPosts(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof communityListQuerySchema.parse>;
  const hasil = await daftarPost(query, req.user?.id);
  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function getPost(req: Request, res: Response): Promise<void> {
  const post = await detailPost(idDari(req, "id", "Postingan tidak ditemukan."), req.user);
  sendSuccess(res, { post });
}

async function postPost(req: Request, res: Response): Promise<void> {
  const post = await buatPost(penggunaDari(req), req.body);
  sendSuccess(res, { post }, 201);
}

async function patchPost(req: Request, res: Response): Promise<void> {
  const post = await ubahPost(
    penggunaDari(req),
    idDari(req, "id", "Postingan tidak ditemukan."),
    req.body,
  );
  sendSuccess(res, { post });
}

async function deletePost(req: Request, res: Response): Promise<void> {
  const hasil = await hapusPost(
    penggunaDari(req),
    idDari(req, "id", "Postingan tidak ditemukan."),
  );
  sendSuccess(res, { message: "Postingan dihapus.", ...hasil });
}

async function postComment(req: Request, res: Response): Promise<void> {
  const komentar = await tambahKomentar(
    penggunaDari(req),
    idDari(req, "id", "Postingan tidak ditemukan."),
    req.body,
  );
  sendSuccess(res, { comment: komentar }, 201);
}

async function deleteComment(req: Request, res: Response): Promise<void> {
  const hasil = await hapusKomentar(
    penggunaDari(req),
    idDari(req, "id", "Komentar tidak ditemukan."),
  );
  sendSuccess(res, { message: "Komentar dihapus.", ...hasil });
}

async function postLike(req: Request, res: Response): Promise<void> {
  const hasil = await toggleLike(
    penggunaDari(req),
    idDari(req, "id", "Postingan tidak ditemukan."),
  );
  sendSuccess(res, hasil);
}

export const communityRoutes = Router();

communityRoutes.get("/posts", optionalAuthenticate, validateQuery(communityListQuerySchema), getPosts);
communityRoutes.get("/posts/:id", optionalAuthenticate, getPost);

communityRoutes.post("/posts", authenticate, validate(postSchema), postPost);
communityRoutes.patch("/posts/:id", authenticate, validate(postSchema), patchPost);
communityRoutes.delete("/posts/:id", authenticate, deletePost);
communityRoutes.post(
  "/posts/:id/comments",
  authenticate,
  validate(commentSchema),
  postComment,
);
communityRoutes.delete("/comments/:id", authenticate, deleteComment);
communityRoutes.post("/posts/:id/like", authenticate, postLike);

async function getAdminPosts(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ReturnType<typeof communityListQuerySchema.parse>;
  const hasil = await daftarPostUntukAdmin(query);
  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

async function patchAdminHide(req: Request, res: Response): Promise<void> {
  const hasil = await aturSembunyi(
    idDari(req, "id", "Postingan tidak ditemukan."),
    (req.body as { isHidden: boolean }).isHidden,
  );
  sendSuccess(res, { message: "Status tampil postingan diperbarui.", ...hasil });
}

export const adminCommunityRoutes = Router();

adminCommunityRoutes.use(authenticate);
adminCommunityRoutes.use(authorize("ADMIN"));
adminCommunityRoutes.get("/posts", validateQuery(communityListQuerySchema), getAdminPosts);
adminCommunityRoutes.patch("/posts/:id/hide", validate(hideSchema), patchAdminHide);
