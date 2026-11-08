import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  AdminTournamentItem,
  AdminTournamentsQuery,
  ManagedResultsResponse,
  ResultEntry,
  ResultStatus,
} from "@/types/management";

export const LABEL_STATUS_HASIL: Record<ResultStatus, string> = {
  PENDING_REVIEW: "Menunggu Tinjauan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const WARNA_STATUS_HASIL: Record<ResultStatus, string> = {
  PENDING_REVIEW: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-danger/15 text-danger",
};

export function buildAdminTournamentParams(
  query: AdminTournamentsQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (query.status) params.status = query.status;
  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

/** Menyusun ulang peringkat menjadi 1..n agar tidak ada lompatan saat baris dihapus. */
export function rapikanPeringkat(entries: ResultEntry[]): ResultEntry[] {
  return entries.map((entri, indeks) => ({ ...entri, position: indeks + 1 }));
}

/**
 * Hasil yang sudah disetujui tidak boleh dihapus penyelenggara (ditinjau ulang
 * saja), sedangkan admin tetap berwenang mengoreksi.
 */
export function bolehHapusHasil(status: ResultStatus, role: "USER" | "ADMIN"): boolean {
  return role === "ADMIN" || status !== "APPROVED";
}

export function validasiHasilLokal(entries: ResultEntry[]): string | null {
  if (entries.length === 0) return "Isi minimal satu hasil.";

  for (const entri of entries) {
    if (!entri.teamOrPlayer.trim() || entri.teamOrPlayer.trim().length < 2) {
      return "Nama tim/pemain minimal 2 karakter.";
    }
    if (!Number.isInteger(entri.position) || entri.position < 1) {
      return "Peringkat tidak valid.";
    }
  }

  const posisi = entries.map((e) => e.position);
  if (new Set(posisi).size !== posisi.length) return "Peringkat tidak boleh ganda.";

  return null;
}

export async function getManagedResults(id: string): Promise<ManagedResultsResponse> {
  const response = await api.get<ApiSuccess<ManagedResultsResponse>>(
    `/tournaments/${encodeURIComponent(id)}/results/manage`,
  );
  return response.data.data;
}

export async function submitResults(id: string, results: ResultEntry[]): Promise<void> {
  await api.put(`/tournaments/${encodeURIComponent(id)}/results`, { results });
}

export async function getAdminTournaments(query: AdminTournamentsQuery): Promise<{
  items: AdminTournamentItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const response = await api.get<ApiSuccess<{ items: AdminTournamentItem[] }>>(
    "/admin/tournaments",
    { params: buildAdminTournamentParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: 12, total: 0 };
  return { items: response.data.data.items, ...meta };
}

export async function setPublished(id: string, isPublished: boolean): Promise<void> {
  await api.patch(`/admin/tournaments/${encodeURIComponent(id)}/publish`, { isPublished });
}

export async function reviewResults(
  id: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
): Promise<void> {
  await api.patch(`/admin/tournaments/${encodeURIComponent(id)}/results/review`, {
    decision,
    note,
  });
}

export async function reviewSingleResult(
  id: string,
  resultId: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
): Promise<void> {
  await api.patch(
    `/admin/tournaments/${encodeURIComponent(id)}/results/${encodeURIComponent(resultId)}/review`,
    { decision, note },
  );
}
