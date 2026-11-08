import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type { GameDetail, GameFilters, GamesPageResult, GamesQuery } from "@/types/games";

export const BATAS_DEFAULT = 12;

/**
 * Menyusun parameter query yang benar-benar dikirim ke API.
 * Nilai kosong/undefined dibuang agar URL bersih dan cache konsisten.
 */
export function buildGamesParams(query: GamesQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  const q = query.q?.trim();
  if (q) params.q = q;

  const platform = query.platform?.trim();
  if (platform) params.platform = platform;

  const genre = query.genre?.trim();
  if (genre) params.genre = genre;

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

export async function getGames(query: GamesQuery): Promise<GamesPageResult> {
  const response = await api.get<ApiSuccess<{ items: GamesPageResult["items"] }>>("/games", {
    params: buildGamesParams(query),
  });

  const meta = response.data.meta ?? { page: 1, limit: BATAS_DEFAULT, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function getGameFilters(): Promise<GameFilters> {
  const response = await api.get<ApiSuccess<GameFilters>>("/games/meta/filters");
  return response.data.data;
}

export async function getGameDetail(slug: string): Promise<GameDetail> {
  const response = await api.get<ApiSuccess<{ game: GameDetail }>>(
    `/games/${encodeURIComponent(slug)}`,
  );
  return response.data.data.game;
}
