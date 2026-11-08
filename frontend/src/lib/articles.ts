import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  ArticleCategory,
  ArticleDetail,
  ArticleFilters,
  ArticlesPageResult,
  ArticlesQuery,
  ArticleType,
} from "@/types/articles";

export const BATAS_ARTIKEL = 9;

export const KATEGORI_PER_TIPE: Record<ArticleType, readonly ArticleCategory[]> = {
  berita: ["NEWS", "UPDATE", "ESPORTS"],
  panduan: ["TIPS", "TUTORIAL"],
};

export const LABEL_KATEGORI: Record<ArticleCategory, string> = {
  NEWS: "Berita",
  UPDATE: "Pembaruan",
  TIPS: "Tips",
  TUTORIAL: "Tutorial",
  ESPORTS: "Esports",
};

export const LABEL_TIPE: Record<ArticleType, string> = {
  berita: "Berita",
  panduan: "Panduan",
};

export const DESKRIPSI_TIPE: Record<ArticleType, string> = {
  berita:
    "Kabar terbaru, pembaruan, dan liputan esports dari dunia game Indonesia.",
  panduan:
    "Tips dan tutorial praktis untuk membantu Anda bermain lebih baik.",
};

export const JALUR_TIPE: Record<ArticleType, string> = {
  berita: "/news",
  panduan: "/guides",
};

/** Menentukan jalur detail artikel berdasarkan kategori. */
export function articlePath(
  category: ArticleCategory | string,
  slug: string,
): string {
  const berita = (KATEGORI_PER_TIPE.berita as readonly string[]).includes(category);
  return `${berita ? JALUR_TIPE.berita : JALUR_TIPE.panduan}/${slug}`;
}

export function tipeUntukKategori(category: ArticleCategory): ArticleType {
  return (KATEGORI_PER_TIPE.berita as readonly ArticleCategory[]).includes(category)
    ? "berita"
    : "panduan";
}

export function buildArticleParams(
  query: ArticlesQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  const q = query.q?.trim();
  if (q) params.q = q;

  if (query.type) params.type = query.type;

  const category = query.category?.trim();
  if (category) params.category = category;

  if (typeof query.page === "number" && Number.isFinite(query.page) && query.page > 1) {
    params.page = Math.floor(query.page);
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit) && query.limit > 0) {
    params.limit = Math.floor(query.limit);
  }

  return params;
}

export function hitungTotalHalamanArtikel(total: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}

export async function getArticles(
  query: ArticlesQuery,
): Promise<ArticlesPageResult> {
  const response = await api.get<ApiSuccess<{ items: ArticlesPageResult["items"] }>>(
    "/articles",
    { params: buildArticleParams(query) },
  );

  const meta = response.data.meta ?? { page: 1, limit: BATAS_ARTIKEL, total: 0 };

  return {
    items: response.data.data.items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  };
}

export async function getArticleFilters(): Promise<ArticleFilters> {
  const response = await api.get<ApiSuccess<ArticleFilters>>("/articles/meta/filters");
  return response.data.data;
}

export async function getArticleDetail(
  slug: string,
  type: ArticleType,
): Promise<ArticleDetail> {
  const response = await api.get<ApiSuccess<{ article: ArticleDetail }>>(
    `/articles/${encodeURIComponent(slug)}`,
    { params: { type } },
  );
  return response.data.data.article;
}
