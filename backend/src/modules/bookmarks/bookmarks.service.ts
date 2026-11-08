import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const PILIHAN_ARTIKEL = {
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

export async function daftarSimpanan(userId: string) {
  const simpanan = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      article: { select: PILIHAN_ARTIKEL },
    },
  });

  return simpanan;
}

export async function tambahSimpanan(userId: string, articleId: string) {
  const artikel = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { id: true },
  });

  if (!artikel) {
    throw ApiError.notFound("Artikel tidak ditemukan.");
  }

  const ada = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId, articleId } },
    select: { id: true, createdAt: true },
  });

  if (ada) {
    return { id: ada.id, createdAt: ada.createdAt, article: artikel, dibuatBaru: false };
  }

  try {
    const baru = await prisma.bookmark.create({
      data: { userId, articleId },
      select: { id: true, createdAt: true },
    });

    return { ...baru, article: artikel, dibuatBaru: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const lama = await prisma.bookmark.findUniqueOrThrow({
        where: { userId_articleId: { userId, articleId } },
        select: { id: true, createdAt: true },
      });
      return { ...lama, article: artikel, dibuatBaru: false };
    }
    throw error;
  }
}

export async function hapusSimpanan(userId: string, articleId: string) {
  const { count } = await prisma.bookmark.deleteMany({
    where: { userId, articleId },
  });

  return { dihapus: count };
}
