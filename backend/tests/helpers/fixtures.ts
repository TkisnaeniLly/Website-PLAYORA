import type { GameStatus, Role, ArticleCategory } from "@prisma/client";
import { prisma } from "./db";

let urutan = 0;
function unik(awalan: string): string {
  urutan += 1;
  return `${awalan}-${Date.now().toString(36)}-${urutan}`;
}

export async function buatPlatform(nama: string) {
  return prisma.platform.create({ data: { name: nama } });
}

export async function buatGame(input: {
  title: string;
  genre: string;
  status?: GameStatus;
  isPopular?: boolean;
  description?: string;
  platformIds?: string[];
}) {
  const slug = unik(input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

  return prisma.game.create({
    data: {
      title: input.title,
      slug,
      description: input.description ?? `Deskripsi untuk ${input.title}.`,
      genre: input.genre,
      status: input.status ?? "PUBLISHED",
      isPopular: input.isPopular ?? false,
      platforms: input.platformIds
        ? { create: input.platformIds.map((platformId) => ({ platformId })) }
        : undefined,
    },
    select: { id: true, title: true, slug: true, genre: true, status: true },
  });
}

export async function buatArtikel(input: {
  title: string;
  gameId: string;
  authorId: string;
  category?: ArticleCategory;
  status?: "DRAFT" | "PUBLISHED";
  publishedAt?: Date | null;
}) {
  return prisma.article.create({
    data: {
      title: input.title,
      slug: unik(input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
      content: `Isi artikel ${input.title}.`,
      category: input.category ?? "NEWS",
      status: input.status ?? "PUBLISHED",
      publishedAt:
        input.publishedAt === undefined
          ? new Date("2026-01-01T00:00:00Z")
          : input.publishedAt,
      authorId: input.authorId,
      gameId: input.gameId,
    },
    select: { id: true, title: true, slug: true, category: true, publishedAt: true },
  });
}

export async function buatTurnamen(input: {
  title: string;
  gameId: string;
  managerId: string;
  isPublished?: boolean;
}) {
  return prisma.tournament.create({
    data: {
      title: input.title,
      slug: unik(input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
      gameId: input.gameId,
      managerId: input.managerId,
      organizerName: "Penyelenggara Uji",
      description: `Deskripsi ${input.title}.`,
      startDate: new Date("2026-12-01"),
      endDate: new Date("2026-12-03"),
      isPublished: input.isPublished ?? true,
      publishedAt: input.isPublished === false ? null : new Date("2026-11-01T00:00:00Z"),
    },
    select: { id: true, title: true, slug: true },
  });
}

export async function buatPengguna(input: {
  email: string;
  username: string;
  role?: Role;
  passwordHash?: string;
}) {
  return prisma.user.create({
    data: {
      name: `Pengguna ${input.username}`,
      username: input.username,
      email: input.email,
      passwordHash: input.passwordHash ?? "$2a$08$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
      role: input.role ?? "USER",
    },
    select: { id: true, email: true, role: true, tokenVersion: true },
  });
}
