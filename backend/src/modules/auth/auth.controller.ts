import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { signAccessToken } from "../../utils/jwt";
import { createCsrfToken } from "../../utils/csrf";
import {
  clearAuthCookie,
  clearCsrfCookie,
  setAuthCookie,
  setCsrfCookie,
} from "../../utils/cookies";
import { ApiError } from "../../utils/ApiError";
import { daftarAkun, masukAkun, type AuthSession } from "./auth.service";

function terbitkanSesi(res: Response, sesi: AuthSession): void {
  const token = signAccessToken({
    sub: sesi.user.id,
    role: sesi.user.role,
    ver: sesi.tokenVersion,
  });
  setAuthCookie(res, token);
  setCsrfCookie(res, createCsrfToken());
}

export async function postRegister(req: Request, res: Response): Promise<void> {
  const sesi = await daftarAkun(req.body);
  terbitkanSesi(res, sesi);
  sendSuccess(res, { user: sesi.user }, 201);
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const sesi = await masukAkun(req.body);
  terbitkanSesi(res, sesi);
  sendSuccess(res, { user: sesi.user });
}

export async function postLogout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  sendSuccess(res, { message: "Berhasil keluar." });
}

export function getMe(req: Request, res: Response): void {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  sendSuccess(res, { user: req.user });
}

export function getCsrfToken(_req: Request, res: Response): void {
  const token = createCsrfToken();
  setCsrfCookie(res, token);
  sendSuccess(res, { csrfToken: token });
}
