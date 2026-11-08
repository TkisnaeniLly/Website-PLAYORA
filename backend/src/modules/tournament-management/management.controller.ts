import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import type { AdminTournamentsQuery, ReviewResultsInput, SubmitResultsInput } from "./management.schema";
import {
  ajukanHasil,
  ambilHasilUntukDikelola,
  aturPublikasi,
  daftarTurnamenAdmin,
  tinjauHasil,
  tinjauHasilSatuan,
} from "./management.service";

function idDari(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Turnamen tidak ditemukan.");
  }
  return id;
}

function penggunaDari(req: Request) {
  const pengguna = req.user;
  if (!pengguna) throw ApiError.unauthorized();
  return pengguna;
}

export async function getManagedResults(req: Request, res: Response): Promise<void> {
  const hasil = await ambilHasilUntukDikelola(penggunaDari(req), idDari(req));
  sendSuccess(res, hasil);
}

export async function putResults(req: Request, res: Response): Promise<void> {
  const hasil = await ajukanHasil(
    penggunaDari(req),
    idDari(req),
    req.body as SubmitResultsInput,
  );

  sendSuccess(res, {
    message: "Hasil dikirim dan menunggu peninjauan admin.",
    jumlah: hasil.jumlah,
  });
}

export async function getAdminTournaments(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as AdminTournamentsQuery;
  const hasil = await daftarTurnamenAdmin(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

export async function patchPublish(req: Request, res: Response): Promise<void> {
  const input = req.body as { isPublished: boolean };
  const hasil = await aturPublikasi(penggunaDari(req), idDari(req), input.isPublished);

  sendSuccess(res, {
    message: hasil.isPublished ? "Turnamen dipublikasikan." : "Publikasi turnamen dibatalkan.",
    isPublished: hasil.isPublished,
  });
}

export async function patchReviewResults(req: Request, res: Response): Promise<void> {
  const hasil = await tinjauHasil(
    penggunaDari(req),
    idDari(req),
    req.body as ReviewResultsInput,
  );

  sendSuccess(res, {
    message: "Keputusan hasil tersimpan.",
    jumlah: hasil.jumlah,
  });
}

export async function patchReviewSingleResult(req: Request, res: Response): Promise<void> {
  const resultId = req.params.resultId;
  if (typeof resultId !== "string" || resultId.length === 0) {
    throw ApiError.notFound("Hasil pertandingan tidak ditemukan.");
  }

  const hasil = await tinjauHasilSatuan(
    penggunaDari(req),
    idDari(req),
    resultId,
    req.body as ReviewResultsInput,
  );

  sendSuccess(res, { message: "Keputusan hasil tersimpan.", result: hasil });
}
