import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  CommunityCategory,
  CommunityCommentItem,
  CommunityListQuery,
  CommunityPageResult,
  CommunityPostDetail,
  CommunityPostItem,
  PostFormValues,
} from "@/types/community";

export const BATAS_KOMUNITAS = 10;

export const LABEL_KATEGORI_KOMUNITAS: Record<CommunityCategory, string> = {
  DISKUSI: "Diskusi",
  TIPS: "Tips",
  TURNAMEN: "Turnamen",
  REKOMENDASI: "Rekomendasi",
  EVENT: "Event",
};

export const WARNA_KATEGORI_KOMUNITAS: Record<CommunityCategory, string> = {
  DISKUSI: "bg-[#7135f5]/20 text-[#c9b8ff]",
  TIPS: "bg-success/15 text-success",
  TURNAMEN: "bg-[#657bff]/20 text-[#a9b6ff]",
  REKOMENDASI: "bg-[#c35bff]/20 text-[#e2b6ff]",
  EVENT: "bg-warning/15 text-warning",
};

export const DAFTAR_KATEGORI_KOMUNITAS: CommunityCategory[] = [
  "DISKUSI",
  "TIPS",
  "TURNAMEN",
  "REKOMENDASI",
  "EVENT",
];

export function buildCommunityParams(
  query: CommunityListQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  const q = query.q?.trim();
  if (q) params.q = q;
  if (query.category) params.category = query.category;
  if (query.sort && query.sort !== "terbaru") params.sort = query.sort;

  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

/** Waktu relatif singkat untuk feed komunitas. */
export function waktuRelatif(nilai: string, sekarang: Date = new Date()): string {
  const waktu = new Date(nilai).getTime();
  if (Number.isNaN(waktu)) return "—";

  const selisihDetik = Math.max(0, Math.floor((sekarang.getTime() - waktu) / 1000));

  if (selisihDetik < 60) return "baru saja";
  const menit = Math.floor(selisihDetik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;

  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata.charAt(0).toUpperCase())
    .join("");
}

export async function getCommunityPosts(
  query: CommunityListQuery,
): Promise<CommunityPageResult> {
  const response = await api.get<ApiSuccess<{ items: CommunityPostItem[] }>>(
    "/community/posts",
    { params: buildCommunityParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_KOMUNITAS, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function getCommunityPost(id: string): Promise<CommunityPostDetail> {
  const response = await api.get<ApiSuccess<{ post: CommunityPostDetail }>>(
    `/community/posts/${encodeURIComponent(id)}`,
  );
  return response.data.data.post;
}

export async function createCommunityPost(
  values: PostFormValues,
): Promise<CommunityPostItem> {
  const response = await api.post<ApiSuccess<{ post: CommunityPostItem }>>(
    "/community/posts",
    values,
  );
  return response.data.data.post;
}

export async function updateCommunityPost(
  id: string,
  values: PostFormValues,
): Promise<CommunityPostItem> {
  const response = await api.patch<ApiSuccess<{ post: CommunityPostItem }>>(
    `/community/posts/${encodeURIComponent(id)}`,
    values,
  );
  return response.data.data.post;
}

export async function deleteCommunityPost(id: string): Promise<void> {
  await api.delete(`/community/posts/${encodeURIComponent(id)}`);
}

export async function addCommunityComment(
  postId: string,
  body: string,
): Promise<CommunityCommentItem> {
  const response = await api.post<ApiSuccess<{ comment: CommunityCommentItem }>>(
    `/community/posts/${encodeURIComponent(postId)}/comments`,
    { body },
  );
  return response.data.data.comment;
}

export async function toggleCommunityLike(
  postId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const response = await api.post<ApiSuccess<{ liked: boolean; likeCount: number }>>(
    `/community/posts/${encodeURIComponent(postId)}/like`,
  );
  return response.data.data;
}

export async function getAdminCommunityPosts(
  query: CommunityListQuery,
): Promise<CommunityPageResult> {
  const response = await api.get<ApiSuccess<{ items: CommunityPostItem[] }>>(
    "/admin/community/posts",
    { params: buildCommunityParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_KOMUNITAS, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function setCommunityHidden(id: string, isHidden: boolean): Promise<void> {
  await api.patch(`/admin/community/posts/${encodeURIComponent(id)}/hide`, { isHidden });
}
