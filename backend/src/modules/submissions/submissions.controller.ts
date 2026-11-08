import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateSubmissionInput,
  DecisionInput,
  ListSubmissionsQuery,
  UpdateSubmissionInput,
} from "./submissions.schema";
import {
  buatPengajuan,
  daftarUntukAdmin,
  daftarPengajuanSaya,
  detailPengajuan,
  perbaruiPengajuan,
  putuskanPengajuan,
} from "./submissions.service";

function idDari(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    throw ApiError.notFound("Pengajuan tidak ditemukan.");
  }
  return id;
}

export async function postSubmission(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) {
    throw ApiError.unauthorized();
  }

  const hasil = await buatPengajuan(pengguna.id, req.body as CreateSubmissionInput);
  sendSuccess(res, { id: hasil.id }, 201);
}

export async function getMySubmissions(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) {
    throw ApiError.unauthorized();
  }

  const query = res.locals.query as ListSubmissionsQuery;
  const hasil = await daftarPengajuanSaya(pengguna.id, query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

export async function getSubmissionDetail(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) {
    throw ApiError.unauthorized();
  }

  const pengajuan = await detailPengajuan(
    pengguna.id,
    idDari(req),
    pengguna.role === "ADMIN",
  );

  sendSuccess(res, { submission: pengajuan });
}

export async function patchSubmission(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) {
    throw ApiError.unauthorized();
  }

  await perbaruiPengajuan(pengguna.id, idDari(req), req.body as UpdateSubmissionInput);
  sendSuccess(res, { message: "Pengajuan diperbarui dan dikirim ulang untuk diperiksa." });
}

export async function getAdminSubmissions(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListSubmissionsQuery;
  const hasil = await daftarUntukAdmin(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

export async function patchAdminDecision(req: Request, res: Response): Promise<void> {
  const pengguna = req.user;
  if (!pengguna) {
    throw ApiError.unauthorized();
  }

  const hasil = await putuskanPengajuan(
    pengguna.id,
    idDari(req),
    req.body as DecisionInput,
  );

  sendSuccess(res, {
    message: "Keputusan pengajuan tersimpan.",
    tournamentId: hasil.tournamentId,
  });
}
