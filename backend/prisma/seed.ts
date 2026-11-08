/**
 * Seed data pengembangan PLAYORA.
 *
 * Sifat: IDEMPOTEN. Setiap baris memakai ID tetap dan di-upsert, sehingga
 * menjalankan `npm run db:seed` berkali-kali tidak menggandakan data.
 *
 * Data ini BUKAN data produksi. Password semua akun contoh: "Playora123!"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const PASSWORD_CONTOH = "Playora123!";

// ID tetap agar seed dapat dijalankan berulang tanpa duplikasi.
const ID = {
  admin: "00000000-0000-4000-8000-000000000001",
  userTika: "00000000-0000-4000-8000-000000000002",
  userArman: "00000000-0000-4000-8000-000000000003",
  userSyah: "00000000-0000-4000-8000-000000000004",

  platformPc: "10000000-0000-4000-8000-000000000001",
  platformPs5: "10000000-0000-4000-8000-000000000002",
  platformXbox: "10000000-0000-4000-8000-000000000003",
  platformSwitch: "10000000-0000-4000-8000-000000000004",
  platformMobile: "10000000-0000-4000-8000-000000000005",

  gameMlbb: "20000000-0000-4000-8000-000000000001",
  gameValorant: "20000000-0000-4000-8000-000000000002",
  gameGenshin: "20000000-0000-4000-8000-000000000003",
  gameFc: "20000000-0000-4000-8000-000000000004",
  gameTotk: "20000000-0000-4000-8000-000000000005",
  gameElden: "20000000-0000-4000-8000-000000000006",

  article1: "30000000-0000-4000-8000-000000000001",
  article2: "30000000-0000-4000-8000-000000000002",
  article3: "30000000-0000-4000-8000-000000000003",
  article4: "30000000-0000-4000-8000-000000000004",
  article5: "30000000-0000-4000-8000-000000000005",
  article6: "30000000-0000-4000-8000-000000000006",

  submissionPending: "40000000-0000-4000-8000-000000000001",
  submissionApproved: "40000000-0000-4000-8000-000000000002",
  reviewApproved: "50000000-0000-4000-8000-000000000001",
  tournamentPublished: "60000000-0000-4000-8000-000000000001",

  result1: "70000000-0000-4000-8000-000000000001",
  result2: "70000000-0000-4000-8000-000000000002",
  result3: "70000000-0000-4000-8000-000000000003",

  resultReview1: "b0000000-0000-4000-8000-000000000001",
  resultReview2: "b0000000-0000-4000-8000-000000000002",
  resultReview3: "b0000000-0000-4000-8000-000000000003",

  favorite1: "80000000-0000-4000-8000-000000000001",
  favorite2: "80000000-0000-4000-8000-000000000002",
  bookmark1: "90000000-0000-4000-8000-000000000001",
  notification1: "a0000000-0000-4000-8000-000000000001",

  communityPost1: "c0000000-0000-4000-8000-000000000001",
  communityPost2: "c0000000-0000-4000-8000-000000000002",
  communityPost3: "c0000000-0000-4000-8000-000000000003",
  communityComment1: "d0000000-0000-4000-8000-000000000001",
  communityComment2: "d0000000-0000-4000-8000-000000000002",

  discordRoom1: "e0000000-0000-4000-8000-000000000001",
  discordRoom2: "e0000000-0000-4000-8000-000000000002",
  discordRoom3: "e0000000-0000-4000-8000-000000000003",
} as const;

const PLATFORMS = [
  { id: ID.platformPc, name: "PC" },
  { id: ID.platformPs5, name: "PlayStation 5" },
  { id: ID.platformXbox, name: "Xbox Series X|S" },
  { id: ID.platformSwitch, name: "Nintendo Switch" },
  { id: ID.platformMobile, name: "Mobile" },
];

const GAMES = [
  {
    id: ID.gameMlbb,
    title: "Mobile Legends: Bang Bang",
    slug: "mobile-legends-bang-bang",
    genre: "MOBA",
    developer: "Moonton",
    publisher: "Moonton",
    releaseDate: new Date("2016-07-14"),
    isPopular: true,
    platforms: [ID.platformMobile],
    description:
      "Game MOBA mobile 5 lawan 5 yang mempertemukan dua tim untuk menghancurkan basis lawan. Populer di kalangan pemain Indonesia dengan ekosistem turnamen yang besar.",
  },
  {
    id: ID.gameValorant,
    title: "Valorant",
    slug: "valorant",
    genre: "FPS",
    developer: "Riot Games",
    publisher: "Riot Games",
    releaseDate: new Date("2020-06-02"),
    isPopular: true,
    platforms: [ID.platformPc],
    description:
      "Penembak taktis 5 lawan 5 berbasis agen dengan kemampuan unik. Menekankan kerja sama tim, penguasaan peta, dan akurasi mekanik.",
  },
  {
    id: ID.gameGenshin,
    title: "Genshin Impact",
    slug: "genshin-impact",
    genre: "Action RPG",
    developer: "HoYoverse",
    publisher: "HoYoverse",
    releaseDate: new Date("2020-09-28"),
    isPopular: true,
    platforms: [ID.platformPc, ID.platformPs5, ID.platformMobile],
    description:
      "RPG dunia terbuka dengan sistem elemen dan eksplorasi luas di dunia Teyvat. Mendukung lintas platform dan pembaruan konten berkala.",
  },
  {
    id: ID.gameFc,
    title: "EA SPORTS FC 26",
    slug: "ea-sports-fc-26",
    genre: "Sports",
    developer: "EA Vancouver",
    publisher: "EA Sports",
    releaseDate: new Date("2025-09-26"),
    isPopular: false,
    platforms: [ID.platformPc, ID.platformPs5, ID.platformXbox],
    description:
      "Simulasi sepak bola dengan mode karier, ultimate team, dan pertandingan daring. Menyediakan liga serta klub dari berbagai negara.",
  },
  {
    id: ID.gameTotk,
    title: "The Legend of Zelda: Tears of the Kingdom",
    slug: "zelda-tears-of-the-kingdom",
    genre: "Adventure",
    developer: "Nintendo EPD",
    publisher: "Nintendo",
    releaseDate: new Date("2023-05-12"),
    isPopular: false,
    platforms: [ID.platformSwitch],
    description:
      "Petualangan dunia terbuka dengan kemampuan merakit benda dan eksplorasi langit serta bawah tanah Hyrule.",
  },
  {
    id: ID.gameElden,
    title: "Elden Ring",
    slug: "elden-ring",
    genre: "Action RPG",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    releaseDate: new Date("2022-02-25"),
    isPopular: true,
    platforms: [ID.platformPc, ID.platformPs5, ID.platformXbox],
    description:
      "Action RPG dunia terbuka dengan pertarungan menantang, eksplorasi bebas, dan narasi yang disampaikan melalui lingkungan.",
  },
];

const ARTICLES = [
  {
    id: ID.article1,
    title: "Jadwal Turnamen Esports Nasional Kuartal Pertama 2027",
    slug: "jadwal-turnamen-esports-nasional-kuartal-pertama-2027",
    category: "NEWS" as const,
    gameId: ID.gameMlbb,
    excerpt:
      "Rangkaian turnamen esports nasional kuartal pertama 2027 telah diumumkan. Berikut daftar tanggal dan kota penyelenggaraannya.",
    content:
      "Penyelenggara esports nasional merilis kalender turnamen untuk kuartal pertama 2027. Turnamen akan digelar di lima kota dengan format kualifikasi terbuka sebelum babak utama.\n\nPendaftaran peserta dilakukan langsung melalui tautan resmi masing-masing penyelenggara, bukan melalui PLAYORA. Informasi pada halaman ini disusun sebagai direktori agar penggemar dapat memantau jadwal.",
  },
  {
    id: ID.article2,
    title: "Pembaruan Musim Baru Mobile Legends: Apa yang Berubah?",
    slug: "pembaruan-musim-baru-mobile-legends",
    category: "UPDATE" as const,
    gameId: ID.gameMlbb,
    excerpt:
      "Penyesuaian keseimbangan hero, perubahan item, dan penyesuaian peta menjadi sorotan pada pembaruan musim terbaru.",
    content:
      "Pembaruan musim terbaru membawa sejumlah penyesuaian keseimbangan. Beberapa hero mendapat pengurangan damage awal, sementara item bertahan mengalami penyesuaian harga.\n\nPemain disarankan meninjau ulang susunan item dan rotasi awal permainan. Perubahan ini berlaku bertahap pada server regional.",
  },
  {
    id: ID.article3,
    title: "Lima Tips Meningkatkan Akurasi Aim di Valorant",
    slug: "lima-tips-meningkatkan-akurasi-aim-valorant",
    category: "TIPS" as const,
    gameId: ID.gameValorant,
    excerpt:
      "Latihan rutin, pengaturan sensitivitas, dan disiplin crosshair placement memberi dampak paling besar pada akurasi.",
    content:
      "Akurasi aim dibangun dari kebiasaan, bukan bakat semata. Mulailah dengan menetapkan sensitivitas yang konsisten dan tidak diubah-ubah setiap sesi.\n\nLatihan singkat namun rutin lebih efektif daripada sesi panjang yang jarang. Fokuskan latihan pada crosshair placement dan kontrol recoil jarak dekat.",
  },
  {
    id: ID.article4,
    title: "Panduan Memulai Genshin Impact untuk Pemain Baru",
    slug: "panduan-memulai-genshin-impact",
    category: "TUTORIAL" as const,
    gameId: ID.gameGenshin,
    excerpt:
      "Urutan eksplorasi, pengelolaan resin, dan prioritas peningkatan karakter untuk pemain yang baru memulai.",
    content:
      "Pemain baru sebaiknya menyelesaikan rangkaian misi pembuka sebelum melakukan eksplorasi bebas. Hal ini membuka sistem utama seperti peningkatan karakter dan domain.\n\nResin sebaiknya digunakan secara rutin, bukan ditumpuk hingga penuh. Prioritaskan peningkatan satu tim inti sebelum menyebar sumber daya ke banyak karakter.",
  },
  {
    id: ID.article5,
    title: "Analisis Meta Turnamen Elden Ring Komunitas",
    slug: "analisis-meta-turnamen-elden-ring-komunitas",
    category: "ESPORTS" as const,
    gameId: ID.gameElden,
    excerpt:
      "Susunan build yang paling sering muncul pada turnamen komunitas dan alasan di balik popularitasnya.",
    content:
      "Turnamen komunitas Elden Ring menampilkan variasi build yang cukup luas. Meskipun demikian, beberapa susunan statistik mendominasi babak akhir.\n\nFaktor penentu bukan hanya statistik, tetapi juga penguasaan timing dan pengelolaan stamina. Analisis ini disusun dari rekaman pertandingan yang dipublikasikan penyelenggara.",
  },
  {
    id: ID.article6,
    title: "Komunitas Lokal Gelar Turnamen Amal untuk Pendidikan",
    slug: "komunitas-lokal-gelar-turnamen-amal-pendidikan",
    category: "NEWS" as const,
    gameId: "__FC__",
    excerpt:
      "Turnamen amal komunitas berhasil mengumpulkan dana untuk program beasiswa pendidikan.",
    content:
      "Sejumlah komunitas gamer lokal menggelar turnamen amal dengan format hiburan. Seluruh hasil donasi disalurkan ke program beasiswa.\n\nKegiatan ini menunjukkan peran komunitas dalam membangun sisi positif ekosistem gaming Indonesia.",
  },
];

async function main() {
  console.log("Mulai seeding PLAYORA...");

  const kataSandi = await bcrypt.hash(PASSWORD_CONTOH, SALT_ROUNDS);

  // ---------------------------------------------------------------- pengguna
  const pengguna = [
    {
      id: ID.admin,
      name: "Administrator PLAYORA",
      username: "admin",
      email: "admin@playora.id",
      role: "ADMIN" as const,
      bio: "Akun administrator platform.",
    },
    {
      id: ID.userTika,
      name: "Tika Isnaeni",
      username: "tika",
      email: "tika@playora.id",
      role: "USER" as const,
      bio: "Penggemar MOBA dan penggemar turnamen lokal.",
    },
    {
      id: ID.userArman,
      name: "Arman Maulana",
      username: "arman",
      email: "arman@playora.id",
      role: "USER" as const,
      bio: "Pengelola komunitas turnamen Valorant.",
    },
    {
      id: ID.userSyah,
      name: "Syah Rizky",
      username: "syah",
      email: "syah@playora.id",
      role: "USER" as const,
      bio: "Pemain kasual yang suka game dunia terbuka.",
    },
  ];

  for (const u of pengguna) {
    const dataPengguna = { ...u, passwordHash: kataSandi };
    await prisma.user.upsert({
      where: { id: u.id },
      update: dataPengguna,
      create: dataPengguna,
    });
  }
  console.log(`  users            : ${pengguna.length}`);

  // --------------------------------------------------------------- platform
  for (const p of PLATFORMS) {
    await prisma.platform.upsert({
      where: { id: p.id },
      update: { name: p.name },
      create: p,
    });
  }
  console.log(`  platforms        : ${PLATFORMS.length}`);

  // ------------------------------------------------------------------ games
  for (const { platforms, ...game } of GAMES) {
    const dataGame = { ...game, status: "PUBLISHED" as const };
    await prisma.game.upsert({
      where: { id: game.id },
      update: dataGame,
      create: dataGame,
    });

    for (const platformId of platforms) {
      await prisma.gamePlatform.upsert({
        where: { gameId_platformId: { gameId: game.id, platformId } },
        update: { gameId: game.id, platformId },
        create: { gameId: game.id, platformId },
      });
    }
  }
  console.log(`  games            : ${GAMES.length}`);

  // --------------------------------------------------------------- articles
  let jumlahArtikel = 0;
  for (const [indeks, artikel] of ARTICLES.entries()) {
    const gameId = artikel.gameId === "__FC__" ? ID.gameFc : artikel.gameId;
    const dataArtikel = {
      title: artikel.title,
      slug: artikel.slug,
      excerpt: artikel.excerpt,
      content: artikel.content,
      category: artikel.category,
      status: "PUBLISHED" as const,
      publishedAt: new Date(`2026-10-${String(10 + indeks).padStart(2, "0")}T09:00:00Z`),
      authorId: ID.admin,
      gameId,
    };
    await prisma.article.upsert({
      where: { id: artikel.id },
      update: dataArtikel,
      create: { id: artikel.id, ...dataArtikel },
    });
    jumlahArtikel++;
  }
  console.log(`  articles         : ${jumlahArtikel}`);

  // --------------------------------------------------- pengajuan turnamen
  // 1) Masih menunggu validasi admin
  const dataPending = {
    submittedBy: ID.userTika,
    gameId: ID.gameMlbb,
    title: "Turnamen Kampus Mobile Legends 2027",
    organizerName: "Himpunan Mahasiswa Teknik Informatika",
    description:
      "Turnamen antarprogram studi dengan format grup dilanjutkan sistem gugur. Terbuka untuk mahasiswa aktif.",
    registrationUrl: "https://contoh.playora.id/daftar/turnamen-kampus",
    contact: "turnamen@contoh.ac.id",
    startDate: new Date("2027-02-10"),
    endDate: new Date("2027-02-14"),
    registrationDeadline: new Date("2027-02-05"),
    format: "5v5, grup + gugur",
    teamCount: 32,
    registrationMethod: "Online",
    prizePool: "Rp5.000.000",
    requirements: "Mahasiswa aktif, satu tim maksimal 6 orang.",
    status: "PENDING" as const,
  };
  await prisma.tournamentSubmission.upsert({
    where: { id: ID.submissionPending },
    update: dataPending,
    create: { id: ID.submissionPending, ...dataPending },
  });

  // 2) Sudah disetujui admin dan dipublikasikan
  const dataDisetujui = {
    submittedBy: ID.userArman,
    gameId: ID.gameValorant,
    title: "Playora Community Cup Valorant Seri 1",
    organizerName: "Komunitas Valorant Indonesia",
    description:
      "Turnamen daring terbuka untuk tim amatir. Babak kualifikasi dilaksanakan secara daring, babak utama digelar luring.",
    registrationUrl: "https://contoh.playora.id/daftar/community-cup-1",
    contact: "komunitas@contoh.id",
    startDate: new Date("2026-12-05"),
    endDate: new Date("2026-12-07"),
    registrationDeadline: new Date("2026-11-28"),
    format: "5v5, single elimination",
    teamCount: 16,
    registrationMethod: "Online",
    prizePool: "Rp10.000.000",
    requirements: "Tim amatir, tidak ada pemain profesional terdaftar.",
    status: "APPROVED" as const,
    reviewedBy: ID.admin,
    reviewedAt: new Date("2026-11-01T10:00:00Z"),
    adminNote: "Informasi lengkap dan tautan pendaftaran dapat diverifikasi.",
  };
  await prisma.tournamentSubmission.upsert({
    where: { id: ID.submissionApproved },
    update: dataDisetujui,
    create: { id: ID.submissionApproved, ...dataDisetujui },
  });

  const dataBeritaAcara = {
    submissionId: ID.submissionApproved,
    adminId: ID.admin,
    decision: "APPROVED" as const,
    note: "Informasi lengkap dan tautan pendaftaran dapat diverifikasi.",
  };
  await prisma.tournamentReview.upsert({
    where: { id: ID.reviewApproved },
    update: dataBeritaAcara,
    create: { id: ID.reviewApproved, ...dataBeritaAcara },
  });

  // ------------------------------------------------------------- turnamen
  const dataTurnamen = {
    submissionId: ID.submissionApproved,
    gameId: ID.gameValorant,
    managerId: ID.userArman,
    title: "Playora Community Cup Valorant Seri 1",
    slug: "playora-community-cup-valorant-seri-1",
    organizerName: "Komunitas Valorant Indonesia",
    description:
      "Turnamen daring terbuka untuk tim amatir. Babak kualifikasi dilaksanakan secara daring, babak utama digelar luring.",
    registrationUrl: "https://contoh.playora.id/daftar/community-cup-1",
    contact: "komunitas@contoh.id",
    startDate: new Date("2026-12-05"),
    endDate: new Date("2026-12-07"),
    registrationDeadline: new Date("2026-11-28"),
    format: "5v5, single elimination",
    teamCount: 16,
    registrationMethod: "Online",
    prizePool: "Rp10.000.000",
    requirements: "Tim amatir, tidak ada pemain profesional terdaftar.",
    isPublished: true,
    publishedAt: new Date("2026-11-01T10:05:00Z"),
    publishedBy: ID.admin,
  };
  await prisma.tournament.upsert({
    where: { id: ID.tournamentPublished },
    update: dataTurnamen,
    create: { id: ID.tournamentPublished, ...dataTurnamen },
  });

  const hasil = [
    { id: ID.result1, reviewId: ID.resultReview1, position: 1, teamOrPlayer: "Garuda Prime", note: "Juara 1" },
    { id: ID.result2, reviewId: ID.resultReview2, position: 2, teamOrPlayer: "Nusantara Five", note: "Juara 2" },
    { id: ID.result3, reviewId: ID.resultReview3, position: 3, teamOrPlayer: "Rimba Esport", note: "Juara 3" },
  ];

  for (const h of hasil) {
    const dataHasil = {
      tournamentId: ID.tournamentPublished,
      position: h.position,
      teamOrPlayer: h.teamOrPlayer,
      note: h.note,
      updatedBy: ID.userArman,
      submittedBy: ID.userArman,
      status: "APPROVED" as const,
      reviewedBy: ID.admin,
      reviewedAt: new Date("2026-11-02T09:00:00Z"),
      adminNote: "Hasil sesuai laporan penyelenggara.",
    };

    await prisma.tournamentResult.upsert({
      where: { id: h.id },
      update: dataHasil,
      create: { id: h.id, ...dataHasil },
    });

    await prisma.tournamentResultReview.upsert({
      where: { id: h.reviewId },
      update: {
        resultId: h.id,
        actorId: ID.admin,
        action: "APPROVED",
        note: "Hasil sesuai laporan penyelenggara.",
      },
      create: {
        id: h.reviewId,
        resultId: h.id,
        actorId: ID.admin,
        action: "APPROVED",
        note: "Hasil sesuai laporan penyelenggara.",
      },
    });
  }
  console.log(`  turnamen         : 1 terpublikasi, 1 menunggu, 1 berita acara`);

  // ------------------------------------------------------- favorit & simpan
  await prisma.userGame.upsert({
    where: { id: ID.favorite1 },
    update: { userId: ID.userTika, gameId: ID.gameMlbb },
    create: { id: ID.favorite1, userId: ID.userTika, gameId: ID.gameMlbb },
  });
  await prisma.userGame.upsert({
    where: { id: ID.favorite2 },
    update: { userId: ID.userTika, gameId: ID.gameGenshin },
    create: { id: ID.favorite2, userId: ID.userTika, gameId: ID.gameGenshin },
  });
  await prisma.bookmark.upsert({
    where: { id: ID.bookmark1 },
    update: { userId: ID.userTika, articleId: ID.article1 },
    create: { id: ID.bookmark1, userId: ID.userTika, articleId: ID.article1 },
  });

  // ------------------------------------------------------------ notifikasi
  await prisma.notification.upsert({
    where: { id: ID.notification1 },
    update: {
      userId: ID.userArman,
      type: "SUBMISSION_APPROVED",
      title: "Pengajuan turnamen disetujui",
      message:
        "Pengajuan \"Playora Community Cup Valorant Seri 1\" telah disetujui dan dipublikasikan.",
      referenceId: ID.submissionApproved,
      isRead: false,
    },
    create: {
      id: ID.notification1,
      userId: ID.userArman,
      type: "SUBMISSION_APPROVED",
      title: "Pengajuan turnamen disetujui",
      message:
        "Pengajuan \"Playora Community Cup Valorant Seri 1\" telah disetujui dan dipublikasikan.",
      referenceId: ID.submissionApproved,
      isRead: false,
    },
  });

  // ------------------------------------------------------------ komunitas
  const postinganKomunitas = [
    {
      id: ID.communityPost1,
      authorId: ID.userArman,
      title: "Rekomendasi game RPG terbaik tahun ini?",
      body: "Menurut kalian, game RPG apa yang paling seru tahun ini? Aku lagi mencari rekomendasi untuk dimainkan bersama teman.",
      category: "REKOMENDASI" as const,
      imageUrl: null,
    },
    {
      id: ID.communityPost2,
      authorId: ID.userTika,
      title: "Tips persiapan turnamen untuk tim pemula",
      body: "Bagikan strategi latihan, pembagian peran, dan cara komunikasi tim yang efektif sebelum mengikuti turnamen pertama.",
      category: "TIPS" as const,
      imageUrl: null,
    },
    {
      id: ID.communityPost3,
      authorId: ID.userSyah,
      title: "Cari teman mabar Valorant akhir pekan",
      body: "Ada yang ingin bermain Valorant akhir pekan ini? Tinggalkan rank dan jam bermain kalian di komentar.",
      category: "DISKUSI" as const,
      imageUrl: null,
    },
  ];

  for (const post of postinganKomunitas) {
    await prisma.communityPost.upsert({
      where: { id: post.id },
      update: post,
      create: post,
    });
  }

  const komentarKomunitas = [
    {
      id: ID.communityComment1,
      postId: ID.communityPost1,
      authorId: ID.userTika,
      body: "Aku sedang memainkan Genshin Impact dan masih menikmati eksplorasinya.",
    },
    {
      id: ID.communityComment2,
      postId: ID.communityPost2,
      authorId: ID.userArman,
      body: "Latihan komunikasi singkat sebelum pertandingan sangat membantu tim kami.",
    },
  ];

  for (const komentar of komentarKomunitas) {
    await prisma.communityComment.upsert({
      where: { id: komentar.id },
      update: komentar,
      create: komentar,
    });
  }

  await prisma.communityPostLike.upsert({
    where: { postId_userId: { postId: ID.communityPost1, userId: ID.userTika } },
    update: {},
    create: { postId: ID.communityPost1, userId: ID.userTika },
  });

  await prisma.communityPostLike.upsert({
    where: { postId_userId: { postId: ID.communityPost2, userId: ID.userArman } },
    update: {},
    create: { postId: ID.communityPost2, userId: ID.userArman },
  });

  // ------------------------------------------------------------ ruang Discord
  const ruangDiscord = [
    {
      id: ID.discordRoom1,
      submittedBy: ID.userArman,
      name: "Valorant Indonesia Mabar",
      inviteUrl: "https://discord.gg/playora-valorant",
      description:
        "Server Discord untuk mencari tim Valorant, latihan scrim, dan berdiskusi strategi map. Aktif setiap malam.",
      gameId: ID.gameValorant,
      memberCount: 1250,
      status: "APPROVED" as const,
      reviewedBy: ID.admin,
      reviewedAt: new Date("2026-11-01T10:00:00Z"),
    },
    {
      id: ID.discordRoom2,
      submittedBy: ID.userTika,
      name: "MLBB Komunitas Nusantara",
      inviteUrl: "https://discord.gg/playora-mlbb",
      description:
        "Tempat berkumpul pemain Mobile Legends: cari duo, bahas meta terbaru, dan ikut turnamen komunitas mingguan.",
      gameId: ID.gameMlbb,
      memberCount: 860,
      status: "APPROVED" as const,
      reviewedBy: ID.admin,
      reviewedAt: new Date("2026-11-02T09:30:00Z"),
    },
    {
      id: ID.discordRoom3,
      submittedBy: ID.userSyah,
      name: "Genshin Teyvat Santai",
      inviteUrl: "https://discord.gg/playora-genshin",
      description:
        "Ruang santai pembahas Genshin Impact: bantuan boss, showcase build, dan diskusi pembaruan versi.",
      gameId: ID.gameGenshin,
      memberCount: 320,
      status: "PENDING" as const,
      reviewedBy: null,
      reviewedAt: null,
    },
  ];

  for (const ruang of ruangDiscord) {
    await prisma.discordRoom.upsert({
      where: { id: ruang.id },
      update: ruang,
      create: ruang,
    });
  }

  console.log("\nSeeding selesai.");
  console.log(`Akun contoh  : admin@playora.id / ${PASSWORD_CONTOH}`);
  console.log(`Akun pengguna: tika@playora.id, arman@playora.id, syah@playora.id / ${PASSWORD_CONTOH}`);
}

main()
  .catch((e) => {
    console.error("Seeding gagal:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
