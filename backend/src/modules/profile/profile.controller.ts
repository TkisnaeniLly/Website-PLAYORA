import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken } from "../../utils/jwt";
import { createCsrfToken } from "../../utils/csrf";
import { setAuthCookie, setCsrfCookie } from "../../utils/cookies";
import type { ChangePasswordInput, UpdateProfileInput } from "./profile.schema";
import { ambilProfil, gantiKataSandi, perbaruiProfil } from "./profile.service";

function penggunaDari(req: Request) {
  const pengguna = req.user;
  if (!pengguna) throw ApiError.unauthorized();
  return pengguna;
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const pengguna = penggunaDari(req);
  const profil = await ambilProfil(pengguna.id);
  sendSuccess(res, { user: profil });
}

export async function patchProfile(req: Request, res: Response): Promise<void> {
  const pengguna = penggunaDari(req);
  const profil = await perbaruiProfil(pengguna.id, req.body as UpdateProfileInput);
  sendSuccess(res, { user: profil });
}

export async function patchPassword(req: Request, res: Response): Promise<void> {
  const pengguna = penggunaDari(req);
  const hasil = await gantiKataSandi(pengguna.id, req.body as ChangePasswordInput);

  const token = signAccessToken({
    sub: pengguna.id,
    role: pengguna.role,
    ver: hasil.tokenVersion,
  });

  setAuthCookie(res, token);
  setCsrfCookie(res, createCsrfToken());

  sendSuccess(res, {
    message: "Kata sandi diperbarui. Sesi lain telah dikeluarkan.",
  });
}
