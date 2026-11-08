import type { Response } from "express";
import {
  authCookieOptions,
  csrfCookieOptions,
  env,
  parseDurationToMs,
} from "../config/env";

export const AUTH_COOKIE = "playora_token";
export const CSRF_COOKIE = "playora_csrf";

const MAKS_UMUR_MS = parseDurationToMs(env.JWT_EXPIRES_IN);

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, { ...authCookieOptions, maxAge: MAKS_UMUR_MS });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, { ...authCookieOptions });
}

export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE, token, { ...csrfCookieOptions, maxAge: MAKS_UMUR_MS });
}

export function clearCsrfCookie(res: Response): void {
  res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions });
}
