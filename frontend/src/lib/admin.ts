import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  AdminArticleInput,
  AdminArticleItem,
  AdminDashboard,
  AdminGameInput,
  AdminGameItem,
  AdminListQuery,
  AdminPageResult,
  AdminUserItem,
} from "@/types/admin";

export const BATAS_ADMIN = 12;

export const LABEL_STATUS: Record<string, string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terbit",
};

export const WARNA_STATUS: Record<string, string> = {
  DRAFT: "bg-navy-100 text-navy-700",
  PUBLISHED: "bg-success/15 text-success",
};

export const LABEL_STATUS_PENGAJUAN: Record<string, string> = {
  PENDING: "Menunggu",
  NEEDS_REVISION: "Perlu revisi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const WARNA_STATUS_PENGAJUAN: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning",
  NEEDS_REVISION: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-danger/15 text-danger",
};

export const LABEL_KATEGORI: Record<string, string> = {
  NEWS: "Berita",
  UPDATE: "Pembaruan",
  TIPS: "Tips",
  TUTORIAL: "Tutorial",
  ESPORTS: "Esports",
};

export const DAFTAR_PLATFORM = ["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch", "Mobile"];

export function buildAdminParams(query: AdminListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  const q = query.q?.trim();
  if (q) params.q = q;

  if (query.status) params.status = query.status;
  if (query.role) params.role = query.role;

  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

/** Mengubah judul menjadi slug yang aman untuk URL. */
export function keSlug(nilai: string): string {
  return nilai
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

export function formatTanggal(nilai: string | null): string {
  if (!nilai) return "—";
  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<ApiSuccess<AdminDashboard>>("/admin/dashboard");
  return response.data.data;
}

export async function getAdminGames(
  query: AdminListQuery,
): Promise<AdminPageResult<AdminGameItem>> {
  const response = await api.get<
    ApiSuccess<{ items: AdminGameItem[] }>
  >("/admin/games", { params: buildAdminParams(query) });

  const meta = response.data.meta ?? { page: 1, limit: BATAS_ADMIN, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function createAdminGame(input: AdminGameInput): Promise<AdminGameItem> {
  const response = await api.post<ApiSuccess<{ game: AdminGameItem }>>("/admin/games", input);
  return response.data.data.game;
}

export async function updateAdminGame(
  id: string,
  input: Partial<AdminGameInput>,
): Promise<AdminGameItem> {
  const response = await api.patch<ApiSuccess<{ game: AdminGameItem }>>(
    `/admin/games/${encodeURIComponent(id)}`,
    input,
  );
  return response.data.data.game;
}

export async function deleteAdminGame(id: string): Promise<void> {
  await api.delete(`/admin/games/${encodeURIComponent(id)}`);
}

export async function getAdminArticles(
  query: AdminListQuery,
): Promise<AdminPageResult<AdminArticleItem>> {
  const response = await api.get<
    ApiSuccess<{ items: AdminArticleItem[] }>
  >("/admin/articles", { params: buildAdminParams(query) });

  const meta = response.data.meta ?? { page: 1, limit: BATAS_ADMIN, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function createAdminArticle(input: AdminArticleInput): Promise<AdminArticleItem> {
  const response = await api.post<ApiSuccess<{ article: AdminArticleItem }>>(
    "/admin/articles",
    input,
  );
  return response.data.data.article;
}

export async function updateAdminArticle(
  id: string,
  input: Partial<AdminArticleInput>,
): Promise<AdminArticleItem> {
  const response = await api.patch<ApiSuccess<{ article: AdminArticleItem }>>(
    `/admin/articles/${encodeURIComponent(id)}`,
    input,
  );
  return response.data.data.article;
}

export async function deleteAdminArticle(id: string): Promise<void> {
  await api.delete(`/admin/articles/${encodeURIComponent(id)}`);
}

export async function getAdminUsers(
  query: AdminListQuery,
): Promise<AdminPageResult<AdminUserItem>> {
  const response = await api.get<
    ApiSuccess<{ items: AdminUserItem[] }>
  >("/admin/users", { params: buildAdminParams(query) });

  const meta = response.data.meta ?? { page: 1, limit: BATAS_ADMIN, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function updateAdminUser(
  id: string,
  input: { role?: "USER" | "ADMIN"; isActive?: boolean },
): Promise<AdminUserItem> {
  const response = await api.patch<ApiSuccess<{ user: AdminUserItem }>>(
    `/admin/users/${encodeURIComponent(id)}`,
    input,
  );
  return response.data.data.user;
}
