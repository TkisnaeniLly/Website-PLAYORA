import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

function petakanGalat(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>, fallback: string) {
  return issues.map((issue) => ({
    field: issue.path.map((bagian) => String(bagian)).join(".") || fallback,
    message: issue.message,
  }));
}

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const hasil = schema.safeParse(req.body);

    if (!hasil.success) {
      next(ApiError.badRequest("Data yang dikirim tidak valid.", petakanGalat(hasil.error.issues, "(body)")));
      return;
    }

    req.body = hasil.data;
    next();
  };
}

// Hasil bersih disimpan di res.locals.query karena req.query bersifat read-only di Express 5.
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const hasil = schema.safeParse(req.query);

    if (!hasil.success) {
      next(
        ApiError.badRequest(
          "Parameter permintaan tidak valid.",
          petakanGalat(hasil.error.issues, "(query)"),
        ),
      );
      return;
    }

    res.locals.query = hasil.data;
    next();
  };
}
