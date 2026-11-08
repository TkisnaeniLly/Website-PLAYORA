import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { ArticleType } from "./articles.constants";
import { kategoriUntukTipe } from "./articles.constants";
import type { ListArticlesQuery } from "./articles.schema";

const PILIHAN_KARTU = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  category: true,
  thumbnailUrl: true,
  publishedAt: true,
  author: { select: { name: true, username: true } },
  game: { select: { id: true, title: true, slug: true } },
} as const;

function syaratPublik(): Prisma.ArticleWhereInput {
  return {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };
}

export async function daftarArtikel(query: ListArticlesQuery): Promise<{
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}> {
  const where: Prisma.ArticleWhereInput = { ...syaratPublik() };

  if (query.category) {
    where.category = query.category;
  } else if (query.type) {
    where.category = { in: [...kategoriUntukTipe(query.type)] };
  }

  if (query.q) {
    where.title = { contains: query.q };
  }

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: query.limit,
      select: PILIHAN_KARTU,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function detailArtikel(slug: string, tipe?: ArticleType) {
  const where: Prisma.ArticleWhereInput = { ...syaratPublik(), slug };

  if (tipe) {
    where.category = { in: [...kategoriUntukTipe(tipe)] };
  }

  const artikel = await prisma.article.findFirst({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      category: true,
      thumbnailUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true, username: true, avatarUrl: true } },
      game: {
        select: { id: true, title: true, slug: true, genre: true, coverImageUrl: true },
      },
    },
  });

  if (!artikel) {
    throw ApiError.notFound("Artikel tidak ditemukan.");
  }

  return artikel;
}

export async function filterArtikel() {
  const baris = await prisma.article.groupBy({
    by: ["category"],
    where: syaratPublik(),
    _count: { _all: true },
    orderBy: { category: "asc" },
  });

  return {
    categories: baris.map((item) => ({
      value: item.category,
      count: item._count._all,
    })),
  };
}
