import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import type { ArticleType } from "./articles.constants";
import type { ListArticlesQuery } from "./articles.schema";
import { daftarArtikel, detailArtikel, filterArtikel } from "./articles.service";

export async function getArticles(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListArticlesQuery;
  const hasil = await daftarArtikel(query);

  sendSuccess(res, { items: hasil.items }, 200, {
    page: hasil.page,
    limit: hasil.limit,
    total: hasil.total,
  });
}

export async function getArticleDetail(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug;
  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error("Slug artikel tidak tersedia");
  }

  const query = (res.locals.query ?? {}) as { type?: ArticleType };
  const artikel = await detailArtikel(slug, query.type);

  sendSuccess(res, { article: artikel });
}

export async function getArticleFilters(_req: Request, res: Response): Promise<void> {
  const filters = await filterArtikel();
  sendSuccess(res, filters);
}
