import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import type { ErrorEnvelope } from "../utils/response";

/**
 * Penanganan route yang tidak dikenal.
 * Mengembalikan 404 dengan bentuk error kanonik.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`));
}

function toErrorEnvelope(
  code: string,
  message: string,
  details?: unknown,
): ErrorEnvelope {
  return details === undefined
    ? { success: false, error: { code, message } }
    : { success: false, error: { code, message, details } };
}

/**
 * Penanganan error terpusat.
 * Express 5 meneruskan error dari handler async secara otomatis,
 * sehingga middleware ini selalu menjadi tujuan akhir.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Error yang kita lempar sendiri
  if (error instanceof ApiError) {
    res
      .status(error.statusCode)
      .json(toErrorEnvelope(error.code, error.message, error.details));
    return;
  }

  // 2. Body JSON tidak valid dari express.json()
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: unknown }).type === "entity.parse.failed"
  ) {
    res
      .status(400)
      .json(toErrorEnvelope("VALIDATION_ERROR", "Body permintaan bukan JSON yang valid."));
    return;
  }

  // 3. Error tak terduga
  const isDev = process.env.NODE_ENV === "development";
  const message =
    isDev && error instanceof Error
      ? error.message
      : "Terjadi kesalahan pada server.";

  const details =
    isDev && error instanceof Error && error.stack
      ? { stack: error.stack.split("\n").slice(0, 10) }
      : undefined;

  res.status(500).json(toErrorEnvelope("INTERNAL_ERROR", message, details));
}
