import { prisma } from "../../config/prisma";

const JUMLAH_HARI_AKTIVITAS = 14;

function awalHari(nilai: Date): Date {
  return new Date(
    Date.UTC(nilai.getUTCFullYear(), nilai.getUTCMonth(), nilai.getUTCDate()),
  );
}

function kunciTanggal(nilai: Date): string {
  return nilai.toISOString().slice(0, 10);
}

export async function ringkasanLaporan() {
  const sekarang = new Date();
  const mulaiAktivitas = new Date(
    awalHari(sekarang).getTime() - (JUMLAH_HARI_AKTIVITAS - 1) * 86_400_000,
  );
  const mulai30Hari = new Date(sekarang.getTime() - 30 * 86_400_000);

  const [
    totalGame,
    gameTerbit,
    totalArtikel,
    artikelTerbit,
    totalTurnamen,
    turnamenTerbit,
    totalPostingan,
    totalKomentar,
    totalLike,
    totalRuang,
    ruangDisetujui,
    ruangMenunggu,
    ruangDitolak,
    totalPengguna,
    penggunaAdmin,
    penggunaBaru30Hari,
    penggunaAktivitas,
    postinganAktivitas,
    pengajuanAktivitas,
    gamePopuler,
    penggunaDenganKontribusi,
  ] = await prisma.$transaction([
    prisma.game.count(),
    prisma.game.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { isPublished: true } }),
    prisma.communityPost.count(),
    prisma.communityComment.count(),
    prisma.communityPostLike.count(),
    prisma.discordRoom.count(),
    prisma.discordRoom.count({ where: { status: "APPROVED" } }),
    prisma.discordRoom.count({ where: { status: "PENDING" } }),
    prisma.discordRoom.count({ where: { status: "REJECTED" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { createdAt: { gte: mulai30Hari } } }),
    prisma.user.findMany({
      where: { createdAt: { gte: mulaiAktivitas } },
      select: { createdAt: true },
    }),
    prisma.communityPost.findMany({
      where: { createdAt: { gte: mulaiAktivitas } },
      select: { createdAt: true },
    }),
    prisma.tournamentSubmission.findMany({
      where: { submittedAt: { gte: mulaiAktivitas } },
      select: { submittedAt: true },
    }),
    prisma.game.findMany({
      orderBy: { favoritedBy: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { favoritedBy: true, articles: true } },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        _count: { select: { articles: true, communityPosts: true } },
      },
    }),
  ]);

  const petaAktivitas = new Map<
    string,
    { date: string; users: number; posts: number; submissions: number }
  >();

  for (let i = 0; i < JUMLAH_HARI_AKTIVITAS; i += 1) {
    const tanggal = kunciTanggal(new Date(mulaiAktivitas.getTime() + i * 86_400_000));
    petaAktivitas.set(tanggal, { date: tanggal, users: 0, posts: 0, submissions: 0 });
  }

  for (const baris of penggunaAktivitas) {
    const titik = petaAktivitas.get(kunciTanggal(baris.createdAt));
    if (titik) titik.users += 1;
  }
  for (const baris of postinganAktivitas) {
    const titik = petaAktivitas.get(kunciTanggal(baris.createdAt));
    if (titik) titik.posts += 1;
  }
  for (const baris of pengajuanAktivitas) {
    const titik = petaAktivitas.get(kunciTanggal(baris.submittedAt));
    if (titik) titik.submissions += 1;
  }

  const kontributor = penggunaDenganKontribusi
    .map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      articles: user._count.articles,
      posts: user._count.communityPosts,
      total: user._count.articles + user._count.communityPosts,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, 5);

  return {
    content: {
      games: { total: totalGame, published: gameTerbit },
      articles: { total: totalArtikel, published: artikelTerbit },
      tournaments: { total: totalTurnamen, published: turnamenTerbit },
      community: {
        posts: totalPostingan,
        comments: totalKomentar,
        likes: totalLike,
      },
      discordRooms: {
        total: totalRuang,
        approved: ruangDisetujui,
        pending: ruangMenunggu,
        rejected: ruangDitolak,
      },
    },
    users: {
      total: totalPengguna,
      admins: penggunaAdmin,
      regular: totalPengguna - penggunaAdmin,
      newLast30Days: penggunaBaru30Hari,
    },
    activity: Array.from(petaAktivitas.values()),
    topGames: gamePopuler.map((game) => ({
      id: game.id,
      title: game.title,
      slug: game.slug,
      favorites: game._count.favoritedBy,
      articles: game._count.articles,
    })),
    topContributors: kontributor,
  };
}
