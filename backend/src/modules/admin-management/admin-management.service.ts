import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import type {
  AdminArticleInput,
  AdminArticleUpdateInput,
  AdminGameInput,
  AdminGameUpdateInput,
  AdminListQuery,
  AdminUserUpdateInput,
} from "./admin-management.schema";

const PILIHAN_GAME = {
  id: true,
  title: true,
  slug: true,
  genre: true,
  description: true,
  developer: true,
  publisher: true,
  releaseDate: true,
  coverImageUrl: true,
  isPopular: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  platforms: { select: { platform: { select: { id: true, name: true } } } },
} as const;

const PILIHAN_ARTIKEL = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  category: true,
  thumbnailUrl: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, username: true } },
  game: { select: { id: true, title: true, slug: true } },
} as const;

function keSlug(nilai: string): string {
  return nilai
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

function keCatch(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw ApiError.conflict("Slug sudah dipakai entri lain.");
  }
  throw error;
}

// ------------------------------------------------------------------- game

export async function daftarGameAdmin(query: AdminListQuery) {
  const where: Prisma.GameWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q ? { title: { contains: query.q } } : {}),
  };
  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.game.count({ where }),
    prisma.game.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: query.limit,
      select: PILIHAN_GAME,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function buatGame(input: AdminGameInput) {
  try {
    return await prisma.game.create({
      data: {
        title: input.title,
        slug: input.slug || keSlug(input.title),
        description: input.description,
        genre: input.genre,
        developer: input.developer ?? null,
        publisher: input.publisher ?? null,
        releaseDate: input.releaseDate ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        isPopular: input.isPopular ?? false,
        status: input.status ?? "DRAFT",
        platforms: input.platformIds?.length
          ? { create: input.platformIds.map((platformId) => ({ platformId })) }
          : undefined,
      },
      select: PILIHAN_GAME,
    });
  } catch (error) {
    keCatch(error);
  }
}

export async function ubahGame(id: string, input: AdminGameUpdateInput) {
  const ada = await prisma.game.findUnique({ where: { id }, select: { id: true } });
  if (!ada) throw ApiError.notFound("Game tidak ditemukan.");

  try {
    return await prisma.$transaction(async (tx) => {
      if (input.platformIds) {
        await tx.gamePlatform.deleteMany({ where: { gameId: id } });
        if (input.platformIds.length > 0) {
          await tx.gamePlatform.createMany({
            data: input.platformIds.map((platformId) => ({ gameId: id, platformId })),
          });
        }
      }

      return tx.game.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.genre !== undefined ? { genre: input.genre } : {}),
          ...(input.developer !== undefined ? { developer: input.developer || null } : {}),
          ...(input.publisher !== undefined ? { publisher: input.publisher || null } : {}),
          ...(input.releaseDate !== undefined ? { releaseDate: input.releaseDate } : {}),
          ...(input.coverImageUrl !== undefined ? { coverImageUrl: input.coverImageUrl || null } : {}),
          ...(input.isPopular !== undefined ? { isPopular: input.isPopular } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
        select: PILIHAN_GAME,
      });
    });
  } catch (error) {
    keCatch(error);
  }
}

export async function hapusGame(id: string) {
  const ada = await prisma.game.findUnique({ where: { id }, select: { id: true } });
  if (!ada) throw ApiError.notFound("Game tidak ditemukan.");

  const dipakai = await prisma.game.findUnique({
    where: { id },
    select: { articles: { select: { id: true }, take: 1 }, submissions: { select: { id: true }, take: 1 } },
  });

  if (dipakai?.articles.length || dipakai?.submissions.length) {
    throw ApiError.conflict(
      "Game masih dirujuk artikel atau pengajuan. Nonaktifkan lewat status DRAFT.",
    );
  }

  await prisma.game.delete({ where: { id } });
  return { id };
}

// ---------------------------------------------------------------- artikel

export async function daftarArtikelAdmin(query: AdminListQuery) {
  const where: Prisma.ArticleWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q ? { title: { contains: query.q } } : {}),
  };
  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: query.limit,
      select: PILIHAN_ARTIKEL,
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function buatArtikel(admin: AuthUser, input: AdminArticleInput) {
  try {
    return await prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug || keSlug(input.title),
        excerpt: input.excerpt || null,
        content: input.content,
        category: input.category,
        thumbnailUrl: input.thumbnailUrl || null,
        status: input.status,
        publishedAt:
          input.publishedAt !== undefined && input.publishedAt !== null
            ? input.publishedAt
            : input.status === "PUBLISHED"
              ? new Date()
              : null,
        authorId: admin.id,
        gameId: input.gameId ?? null,
      },
      select: PILIHAN_ARTIKEL,
    });
  } catch (error) {
    keCatch(error);
  }
}

export async function ubahArtikel(id: string, input: AdminArticleUpdateInput) {
  const ada = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!ada) throw ApiError.notFound("Artikel tidak ditemukan.");

  try {
    return await prisma.article.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt || null } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl || null } : {}),
        ...(input.gameId !== undefined ? { gameId: input.gameId || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.publishedAt !== undefined ? { publishedAt: input.publishedAt } : {}),
      },
      select: PILIHAN_ARTIKEL,
    });
  } catch (error) {
    keCatch(error);
  }
}

export async function hapusArtikel(id: string) {
  const ada = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!ada) throw ApiError.notFound("Artikel tidak ditemukan.");

  const dipakai = await prisma.bookmark.count({ where: { articleId: id } });
  if (dipakai > 0) {
    throw ApiError.conflict(
      "Artikel masih disimpan pengguna. Ubah status menjadi DRAFT alih-alih menghapusnya.",
    );
  }

  await prisma.article.delete({ where: { id } });
  return { id };
}

// ---------------------------------------------------------------- pengguna

export async function daftarPengguna(query: AdminListQuery) {
  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q } },
            { username: { contains: query.q } },
            { email: { contains: query.q } },
          ],
        }
      : {}),
  };
  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { submissions: true, notifications: true } },
      },
    }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function ubahPengguna(admin: AuthUser, id: string, input: AdminUserUpdateInput) {
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) throw ApiError.notFound("Pengguna tidak ditemukan.");

  if (target.id === admin.id) {
    if (input.role !== undefined && input.role !== "ADMIN") {
      throw ApiError.conflict("Admin tidak dapat menurunkan perannya sendiri.");
    }
    if (input.isActive === false) {
      throw ApiError.conflict("Admin tidak dapat menonaktifkan akunnya sendiri.");
    }
  }

  const pengguna = await prisma.user.update({
    where: { id },
    data: {
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined
        ? {
            isActive: input.isActive,
            ...(input.isActive === false ? { tokenVersion: { increment: 1 } } : {}),
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return pengguna;
}

// ---------------------------------------------------------------- dashboard

export async function ringkasanDashboard() {
  const [
    totalPengguna,
    penggunaAktif,
    totalGame,
    gameTerbit,
    totalArtikel,
    artikelTerbit,
    totalTurnamen,
    pertandinganTerbit,
    totalNotifikasi,
    pengajuanPending,
    pengajuanRevisi,
    pengajuanDisetujui,
    pengajuanDitolak,
    hasilMenunggu,
    pengajuanTerbaru,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.game.count(),
    prisma.game.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { isPublished: true } }),
    prisma.notification.count(),
    prisma.tournamentSubmission.count({ where: { status: "PENDING" } }),
    prisma.tournamentSubmission.count({ where: { status: "NEEDS_REVISION" } }),
    prisma.tournamentSubmission.count({ where: { status: "APPROVED" } }),
    prisma.tournamentSubmission.count({ where: { status: "REJECTED" } }),
    prisma.tournamentResult.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.tournamentSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        submittedAt: true,
        submitter: { select: { name: true, username: true } },
      },
    }),
  ]);

  return {
    users: { total: totalPengguna, active: penggunaAktif },
    games: { total: totalGame, published: gameTerbit },
    articles: { total: totalArtikel, published: artikelTerbit },
    tournaments: { total: totalTurnamen, published: pertandinganTerbit },
    submissions: {
      pending: pengajuanPending,
      needsRevision: pengajuanRevisi,
      approved: pengajuanDisetujui,
      rejected: pengajuanDitolak,
    },
    pendingReviewResults: hasilMenunggu,
    notifications: totalNotifikasi,
    recentSubmissions: pengajuanTerbaru,
  };
}
