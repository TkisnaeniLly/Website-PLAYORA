import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { ListGamesQuery } from "./games.schema";

const PILIHAN_KARTU = {
  id: true,
  title: true,
  slug: true,
  genre: true,
  coverImageUrl: true,
  isPopular: true,
  releaseDate: true,
  platforms: { select: { platform: { select: { id: true, name: true } } } },
} as const;

export interface GameListItem {
  id: string;
  title: string;
  slug: string;
  genre: string;
  coverImageUrl: string | null;
  isPopular: boolean;
  releaseDate: Date | null;
  platforms: { platform: { id: string; name: string } }[];
}

function susunWhere(query: ListGamesQuery) {
  return {
    status: "PUBLISHED" as const,
    ...(query.q ? { title: { contains: query.q } } : {}),
    ...(query.genre ? { genre: query.genre } : {}),
    ...(query.platform
      ? { platforms: { some: { platform: { name: query.platform } } } }
      : {}),
  };
}

export async function daftarGame(query: ListGamesQuery): Promise<{
  items: GameListItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const where = susunWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.game.count({ where }),
    prisma.game.findMany({
      where,
      orderBy: [{ isPopular: "desc" }, { title: "asc" }],
      skip,
      take: query.limit,
      select: PILIHAN_KARTU,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function detailGame(slug: string) {
  const game = await prisma.game.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      genre: true,
      developer: true,
      publisher: true,
      releaseDate: true,
      coverImageUrl: true,
      isPopular: true,
      platforms: { select: { platform: { select: { id: true, name: true } } } },
      articles: {
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          thumbnailUrl: true,
          publishedAt: true,
        },
      },
      tournaments: {
        where: { isPublished: true },
        orderBy: { startDate: "asc" },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          organizerName: true,
          startDate: true,
          endDate: true,
          prizePool: true,
        },
      },
    },
  });

  if (!game) {
    throw ApiError.notFound("Game tidak ditemukan.");
  }

  return game;
}

export async function filterKatalog() {
  const [platforms, genres] = await prisma.$transaction([
    prisma.platform.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.game.groupBy({
      by: ["genre"],
      where: { status: "PUBLISHED" },
      orderBy: { genre: "asc" },
    }),
  ]);

  return {
    platforms,
    genres: genres.map((baris) => baris.genre),
  };
}
