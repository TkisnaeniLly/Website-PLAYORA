import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import { awalHariIni, statusDariTanggal } from "./tournaments.constants";
import type { ListTournamentsQuery } from "./tournaments.schema";

/**
 * Gerbang publik: turnamen harus sudah dipublikasikan, dan bila berasal dari
 * pengajuan, pengajuan itu harus berstatus APPROVED. Pemeriksaan kedua mencegah
 * turnamen tampil publik akibat data yang tidak konsisten (mis. publikasi
 * dilakukan sebelum pengajuan disetujui).
 */
function syaratPublik(): Prisma.TournamentWhereInput {
  return {
    isPublished: true,
    OR: [{ submissionId: null }, { submission: { status: "APPROVED" } }],
  };
}

function syaratStatus(status: string, hariIni: Date): Prisma.TournamentWhereInput {
  if (status === "upcoming") return { startDate: { gt: hariIni } };
  if (status === "finished") return { endDate: { lt: hariIni } };
  return { startDate: { lte: hariIni }, endDate: { gte: hariIni } };
}

const PILIHAN_KARTU = {
  id: true,
  title: true,
  slug: true,
  organizerName: true,
  startDate: true,
  endDate: true,
  registrationDeadline: true,
  format: true,
  prizePool: true,
  game: { select: { id: true, title: true, slug: true, genre: true } },
} as const;

export async function daftarTurnamen(query: ListTournamentsQuery): Promise<{
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}> {
  const hariIni = awalHariIni();

  const where: Prisma.TournamentWhereInput = {
    ...syaratPublik(),
    ...(query.status ? syaratStatus(query.status, hariIni) : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, baris] = await prisma.$transaction([
    prisma.tournament.count({ where }),
    prisma.tournament.findMany({
      where,
      orderBy: [{ startDate: "asc" }, { title: "asc" }],
      skip,
      take: query.limit,
      select: PILIHAN_KARTU,
    }),
  ]);

  const items = baris.map((item) => ({
    ...item,
    status: statusDariTanggal(item.startDate, item.endDate),
  }));

  return { items, total, page: query.page, limit: query.limit };
}

export async function detailTurnamen(slug: string, user?: AuthUser) {
  const turnamen = await prisma.tournament.findFirst({
    where: { ...syaratPublik(), slug },
    select: {
      id: true,
      title: true,
      slug: true,
      organizerName: true,
      description: true,
      registrationUrl: true,
      contact: true,
      startDate: true,
      endDate: true,
      registrationDeadline: true,
      format: true,
      prizePool: true,
      requirements: true,
      isPublished: true,
      publishedAt: true,
      managerId: true,
      game: { select: { id: true, title: true, slug: true, genre: true, coverImageUrl: true } },
      results: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        select: { id: true, position: true, teamOrPlayer: true, note: true },
      },
    },
  });

  if (!turnamen) {
    throw ApiError.notFound("Turnamen tidak ditemukan.");
  }

  const { managerId, ...publik } = turnamen;

  return {
    ...publik,
    status: statusDariTanggal(turnamen.startDate, turnamen.endDate),
    canManage: Boolean(
      user && (user.role === "ADMIN" || (managerId !== null && managerId === user.id)),
    ),
  };
}
