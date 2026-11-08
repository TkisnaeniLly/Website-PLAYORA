import type { Response } from "express";

/** Metadata paginasi untuk endpoint daftar. */
export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Mengirim respons sukses dengan bentuk seragam:
 * { success: true, data, meta? }
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ResponseMeta,
): Response {
  const body: SuccessEnvelope<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };

  return res.status(statusCode).json(body);
}
