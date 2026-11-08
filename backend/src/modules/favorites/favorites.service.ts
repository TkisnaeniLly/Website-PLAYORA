import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const PILIHAN_GAME = {
  id: true,
  title: true,
  slug: true,
  genre: true,
  coverImageUrl: true,
  isPopular: true,
  releaseDate: true,
  platforms: { select: { platform: { select: { id: true, name: true } } } },
} as const;

export async function daftarFavorit(userId: string) {
  const favorit = await prisma.userGame.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      game: { select: PILIHAN_GAME },
    },
  });

  return favorit;
}

export async function tambahFavorit(userId: string, gameId: string) {
  const game = await prisma.game.findFirst({
    where: { id: gameId, status: "PUBLISHED" },
    select: { id: true },
  });

  if (!game) {
    throw ApiError.notFound("Game tidak ditemukan.");
  }

  const ada = await prisma.userGame.findUnique({
    where: { userId_gameId: { userId, gameId } },
    select: { id: true, createdAt: true },
  });

  if (ada) {
    return { id: ada.id, createdAt: ada.createdAt, game, dibuatBaru: false };
  }

  try {
    const baru = await prisma.userGame.create({
      data: { userId, gameId },
      select: { id: true, createdAt: true },
    });

    return { ...baru, game, dibuatBaru: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const lama = await prisma.userGame.findUniqueOrThrow({
        where: { userId_gameId: { userId, gameId } },
        select: { id: true, createdAt: true },
      });
      return { ...lama, game, dibuatBaru: false };
    }
    throw error;
  }
}

export async function hapusFavorit(userId: string, gameId: string) {
  const { count } = await prisma.userGame.deleteMany({
    where: { userId, gameId },
  });

  return { dihapus: count };
}
