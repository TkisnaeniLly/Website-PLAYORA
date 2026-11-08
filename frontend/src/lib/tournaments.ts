import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  TournamentDetail,
  TournamentStatus,
  TournamentsPageResult,
  TournamentsQuery,
} from "@/types/tournaments";

export const BATAS_TURNAMEN = 9;

export const LABEL_STATUS: Record<TournamentStatus, string> = {
  upcoming: "Mendatang",
  ongoing: "Berlangsung",
  finished: "Selesai",
};

export const URUTAN_STATUS: readonly TournamentStatus[] = [
  "upcoming",
  "ongoing",
  "finished",
];

export const WARNA_STATUS: Record<TournamentStatus, string> = {
  upcoming: "bg-accent text-navy-950",
  ongoing: "bg-success text-white",
  finished: "bg-navy-200 text-navy-800",
};

export function formatTanggal(nilai: string | null): string {
  if (!nilai) return "—";
  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRentangTanggal(mulai: string, selesai: string): string {
  const awal = new Date(mulai);
  const akhir = new Date(selesai);

  if (awal.toDateString() === akhir.toDateString()) {
    return formatTanggal(mulai);
  }

  const samaLokasi =
    awal.getUTCMonth() === akhir.getUTCMonth() && awal.getUTCFullYear() === akhir.getUTCFullYear();

  if (samaLokasi) {
    const sisa = akhir.toLocaleDateString("id-ID", { day: "numeric", year: "numeric" });
    return `${awal.toLocaleDateString("id-ID", { day: "numeric" })} – ${sisa}`;
  }

  return `${formatTanggal(mulai)} – ${formatTanggal(selesai)}`;
}

export function buildTournamentParams(
  query: TournamentsQuery,
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

export function hitungTotalHalaman(total: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}

/** Label peringkat: 1 → "Juara 1", 2 → "Peringkat 2". */
export function labelPeringkat(position: number): string {
  return position === 1 ? "Juara 1" : `Peringkat ${position}`;
}

export async function getTournaments(
  query: TournamentsQuery,
): Promise<TournamentsPageResult> {
  const response = await api.get<
    ApiSuccess<{ items: TournamentsPageResult["items"] }>
  >("/tournaments", { params: buildTournamentParams(query) });

  const meta = response.data.meta ?? { page: 1, limit: BATAS_TURNAMEN, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function getTournamentDetail(slug: string): Promise<TournamentDetail> {
  const response = await api.get<ApiSuccess<{ tournament: TournamentDetail }>>(
    `/tournaments/${encodeURIComponent(slug)}`,
  );
  return response.data.data.tournament;
}
