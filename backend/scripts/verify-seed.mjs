/**
 * Verifikasi hasil seed + integritas data PLAYORA.
 *
 * Dijalankan setelah `npm run db:seed`. Membuktikan bahwa data contoh benar,
 * password benar-benar ter-hash, relasi utuh, dan constraint database
 * (unique & foreign key) benar-benar ditegakkan mesin database.
 *
 * Jalankan: node scripts/verify-seed.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let lulus = 0;
let gagal = 0;

function ok(p) {
  lulus++;
  console.log(`  PASS  ${p}`);
}
function fail(p) {
  gagal++;
  console.log(`  FAIL  ${p}`);
}
function samaDengan(aktual, harapan, label) {
  if (aktual === harapan) ok(`${label} = ${harapan}`);
  else fail(`${label} = ${aktual}, seharusnya ${harapan}`);
}

async function main() {
  console.log("\n=== VERIFIKASI SEED & INTEGRITAS DATA ===\n");

  // ------------------------------------------------------------- pengguna
  console.log("[1] Pengguna & password");
  const jumlahUser = await prisma.user.count();
  if (jumlahUser >= 4) ok(`jumlah users >= 4 (${jumlahUser})`);
  else fail(`jumlah users hanya ${jumlahUser}, seharusnya minimal 4`);

  const emailSeed = ["admin@playora.id", "tika@playora.id", "arman@playora.id", "syah@playora.id"];
  for (const email of emailSeed) {
    const ada = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (ada) ok(`akun seed ${email} ada`);
    else fail(`akun seed ${email} HILANG`);
  }

  const admin = await prisma.user.findUnique({ where: { email: "admin@playora.id" } });
  if (!admin) fail("akun admin@playora.id tidak ada");
  else {
    samaDengan(admin.role, "ADMIN", "role admin");
    ok("admin@playora.id ditemukan");
  }

  const semuaUser = await prisma.user.findMany({
    select: { username: true, passwordHash: true, email: true },
  });
  const bukanBcrypt = semuaUser.filter(
    (u) => !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(u.passwordHash),
  );
  if (bukanBcrypt.length === 0) ok("semua password berupa hash bcrypt (60 karakter)");
  else fail(`password bukan hash bcrypt: ${bukanBcrypt.map((u) => u.username).join(", ")}`);

  const sandiTerbuka = semuaUser.filter(
    (u) => u.passwordHash.includes("Playora123!") || u.passwordHash.length < 50,
  );
  if (sandiTerbuka.length === 0) ok("tidak ada password tersimpan sebagai teks biasa");
  else fail(`password teks biasa terdeteksi: ${sandiTerbuka.length} akun`);

  // ------------------------------------------------------------------ katalog
  console.log("\n[2] Katalog game");
  samaDengan(await prisma.game.count(), 6, "jumlah games");

  const gameTerbit = await prisma.game.count({ where: { status: "PUBLISHED" } });
  samaDengan(gameTerbit, 6, "games berstatus PUBLISHED");

  const gameDraf = await prisma.game.count({ where: { status: "DRAFT" } });
  samaDengan(gameDraf, 0, "games berstatus DRAFT pada data seed");
  samaDengan(await prisma.platform.count(), 5, "jumlah platforms");

  const relasiPlatform = await prisma.gamePlatform.count();
  if (relasiPlatform >= 10) ok(`game_platforms terisi (${relasiPlatform} relasi)`);
  else fail(`game_platforms hanya ${relasiPlatform}, seharusnya >= 10`);

  const gameTanpaPlatform = await prisma.game.count({
    where: { platforms: { none: {} } },
  });
  samaDengan(gameTanpaPlatform, 0, "game tanpa platform");

  // ------------------------------------------------------------------ artikel
  console.log("\n[3] Artikel");
  samaDengan(await prisma.article.count(), 6, "jumlah articles");

  const kategoriAda = new Set(
    (await prisma.article.findMany({ select: { category: true } })).map((a) => a.category),
  );
  const kategoriWajib = ["NEWS", "UPDATE", "TIPS", "TUTORIAL", "ESPORTS"];
  const kategoriKurang = kategoriWajib.filter((k) => !kategoriAda.has(k));
  if (kategoriKurang.length === 0) ok("5 kategori artikel semuanya terwakili");
  else fail(`kategori belum terwakili: ${kategoriKurang.join(", ")}`);

  const artikelTerbit = await prisma.article.count({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
  });
  samaDengan(artikelTerbit, 6, "artikel PUBLISHED dengan publishedAt");

  const artikelDenganGame = await prisma.article.count({ where: { gameId: { not: null } } });
  if (artikelDenganGame >= 5) ok(`artikel tertaut ke game (${artikelDenganGame})`);
  else fail(`artikel tertaut ke game hanya ${artikelDenganGame}`);

  // ---------------------------------------------------------------- turnamen
  console.log("\n[4] Pengajuan & turnamen");
  const menunggu = await prisma.tournamentSubmission.count({ where: { status: "PENDING" } });
  const disetujui = await prisma.tournamentSubmission.count({ where: { status: "APPROVED" } });
  samaDengan(menunggu, 1, "pengajuan PENDING");
  samaDengan(disetujui, 1, "pengajuan APPROVED");

  const beritaAcara = await prisma.tournamentReview.count();
  if (beritaAcara >= 1) ok(`riwayat keputusan admin tercatat (${beritaAcara})`);
  else fail("tournament_reviews kosong");

  const turnamenTerbit = await prisma.tournament.count({ where: { isPublished: true } });
  samaDengan(turnamenTerbit, 1, "turnamen terpublikasi");

  const turnamen = await prisma.tournament.findFirst({
    where: { isPublished: true },
    include: { submission: true, manager: true, publisher: true, results: true },
  });

  if (!turnamen) fail("turnamen terpublikasi tidak ditemukan");
  else {
    if (turnamen.submissionId === null) fail("turnamen tidak tertaut ke pengajuan");
    else ok("turnamen tertaut ke pengajuan (submission_id terisi)");

    if (turnamen.submission?.status === "APPROVED") ok("pengajuan terkait berstatus APPROVED");
    else fail(`pengajuan terkait berstatus ${turnamen.submission?.status}`);

    if (turnamen.managerId === null) fail("manager_id kosong (penyelenggara tidak tercatat)");
    else ok(`manager tercatat: ${turnamen.manager?.username ?? "-"}`);

    if (turnamen.publishedBy === null) fail("published_by kosong");
    else ok(`penerbit tercatat: ${turnamen.publisher?.username ?? "-"}`);

    samaDengan(turnamen.results.length, 3, "hasil turnamen");
  }

  const posisiUnik = await prisma.tournamentResult.groupBy({
    by: ["position"],
    _count: { position: true },
  });
  const posisiGanda = posisiUnik.filter((p) => p._count.position > 1);
  if (posisiGanda.length === 0) ok("posisi hasil unik per turnamen");
  else fail(`posisi ganda terdeteksi: ${posisiGanda.length}`);

  // ------------------------------------------------- jejak tinjauan hasil
  console.log("\n[4b] Jejak tinjauan hasil pertandingan");

  const hasilTanpaReviewer = await prisma.tournamentResult.count({
    where: { status: "APPROVED", OR: [{ reviewedBy: null }, { reviewedAt: null }] },
  });
  if (hasilTanpaReviewer === 0) ok("setiap hasil APPROVED punya reviewer & waktu tinjauan");
  else fail(`hasil APPROVED tanpa reviewer/waktu tinjauan: ${hasilTanpaReviewer}`);

  const hasilTanpaPengaju = await prisma.tournamentResult.count({
    where: { submittedBy: null },
  });
  if (hasilTanpaPengaju === 0) ok("setiap hasil mencatat pengajunya (submitted_by)");
  else fail(`hasil tanpa pengaju: ${hasilTanpaPengaju}`);

  const hasilTanpaAudit = await prisma.tournamentResult.count({
    where: { reviews: { none: {} } },
  });
  if (hasilTanpaAudit === 0) ok("setiap hasil punya jejak audit (tournament_result_reviews)");
  else fail(`hasil tanpa jejak audit: ${hasilTanpaAudit}`);

  const hasilDenganCatatan = await prisma.tournamentResult.count({
    where: { status: "APPROVED", adminNote: null },
  });
  if (hasilDenganCatatan === 0) ok("setiap hasil APPROVED punya catatan admin");
  else fail(`hasil APPROVED tanpa catatan admin: ${hasilDenganCatatan}`);

  // ------------------------------------------- kelengkapan data pengajuan
  console.log("\n[4c] Kelengkapan data pengajuan & turnaround");

  const pengajuanTidakLengkap = await prisma.tournamentSubmission.count({
    where: {
      OR: [
        { teamCount: null },
        { registrationMethod: null },
        { format: null },
        { registrationUrl: null },
        { contact: null },
      ],
    },
  });
  if (pengajuanTidakLengkap === 0) ok("setiap pengajuan punya team_count, registration_method, format & kontak");
  else fail(`pengajuan tidak lengkap: ${pengajuanTidakLengkap}`);

  const timetableTanpaTeam = await prisma.tournament.count({
    where: { OR: [{ teamCount: null }, { registrationMethod: null }] },
  });
  if (timetableTanpaTeam === 0) ok("setiapournament punya team_count & registration_method");
  else fail(`turnamen tanpa team_count/registration_method: ${timetableTanpaTeam}`);

  const timTidakValid = await prisma.tournamentSubmission.count({
    where: { teamCount: { not: null, lt: 2 } },
  });
  if (timTidakValid === 0) ok("team_count minimal 2 sesuai aturan validasi");
  else fail(`team_count di bawah 2: ${timTidakValid}`);

  // ------------------------------------------------------- fitur personal
  console.log("\n[5] Fitur personal");
  const favorit = await prisma.userGame.count();
  const simpanan = await prisma.bookmark.count();
  const notifikasi = await prisma.notification.count();
  if (favorit >= 2) ok(`game favorit terisi (${favorit})`);
  else fail(`game favorit hanya ${favorit}`);
  if (simpanan >= 1) ok(`bookmark terisi (${simpanan})`);
  else fail("bookmark kosong");
  if (notifikasi >= 1) ok(`notifikasi terisi (${notifikasi})`);
  else fail("notifikasi kosong");

  // ------------------------------------------------------------ komunitas
  console.log("\n[5b] Komunitas");
  const postinganKomunitas = await prisma.communityPost.count();
  const komentarKomunitas = await prisma.communityComment.count();
  const sukaKomunitas = await prisma.communityPostLike.count();
  if (postinganKomunitas >= 3) ok(`postingan komunitas terisi (${postinganKomunitas})`);
  else fail(`postingan komunitas hanya ${postinganKomunitas}`);
  if (komentarKomunitas >= 2) ok(`komentar komunitas terisi (${komentarKomunitas})`);
  else fail(`komentar komunitas hanya ${komentarKomunitas}`);
  if (sukaKomunitas >= 2) ok(`like komunitas terisi (${sukaKomunitas})`);
  else fail(`like komunitas hanya ${sukaKomunitas}`);

  // ------------------------------------------------------ ruang Discord
  console.log("\n[5c] Ruang Discord");
  const ruangDisetujui = await prisma.discordRoom.count({ where: { status: "APPROVED" } });
  const ruangMenunggu = await prisma.discordRoom.count({ where: { status: "PENDING" } });
  if (ruangDisetujui >= 2) ok(`ruang Discord disetujui terisi (${ruangDisetujui})`);
  else fail(`ruang Discord disetujui hanya ${ruangDisetujui}`);
  if (ruangMenunggu >= 1) ok(`ruang Discord menunggu validasi terisi (${ruangMenunggu})`);
  else fail(`ruang Discord menunggu validasi hanya ${ruangMenunggu}`);
  if (ruangDisetujui > 0) {
    const tanpaReviewer = await prisma.discordRoom.count({
      where: { status: "APPROVED", reviewedBy: null },
    });
    if (tanpaReviewer === 0) ok("setiap ruang disetujui punya peninjau");
    else fail(`${tanpaReviewer} ruang disetujui tanpa peninjau`);
  }

  // ------------------------------------------- penegakan constraint nyata
  console.log("\n[6] Constraint benar-benar ditegakkan database");

  // Unique: username duplikat harus ditolak
  try {
    await prisma.user.create({
      data: {
        name: "Duplikat",
        username: "admin",
        email: "duplikat@playora.id",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuv",
      },
    });
    fail("username duplikat DITERIMA (unique tidak berfungsi)");
  } catch (e) {
    if (e.code === "P2002") ok("username duplikat ditolak (P2002)");
    else fail(`username duplikat gagal dengan kode tak terduga: ${e.code ?? e.message}`);
  }

  // Foreign key: bookmark ke artikel fiktif harus ditolak
  try {
    const tika = await prisma.user.findUnique({ where: { email: "tika@playora.id" } });
    await prisma.bookmark.create({
      data: {
        userId: tika.id,
        articleId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      },
    });
    fail("bookmark ke artikel fiktif DITERIMA (FK tidak berfungsi)");
  } catch (e) {
    if (e.code === "P2003") ok("bookmark ke artikel fiktif ditolak (P2003)");
    else fail(`FK gagal dengan kode tak terduga: ${e.code ?? e.message}`);
  }

  // Unique gabungan: favorit ganda harus ditolak
  try {
    const tika = await prisma.user.findUnique({ where: { email: "tika@playora.id" } });
    const game = await prisma.game.findUnique({ where: { slug: "mobile-legends-bang-bang" } });
    await prisma.userGame.create({ data: { userId: tika.id, gameId: game.id } });
    fail("favorit ganda DITERIMA (unique gabungan tidak berfungsi)");
  } catch (e) {
    if (e.code === "P2002") ok("favorit ganda ditolak (P2002)");
    else fail(`favorit ganda gagal dengan kode tak terduga: ${e.code ?? e.message}`);
  }

  // ------------------------------------------------------------- ringkasan
  console.log("\n=== RINGKASAN ===");
  console.log(`LULUS : ${lulus}`);
  console.log(`GAGAL : ${gagal}`);

  if (gagal > 0) {
    console.log("\nHASIL: SEED / INTEGRITAS BELUM SESUAI\n");
    process.exitCode = 1;
  } else {
    console.log("\nHASIL: SEED & INTEGRITAS SESUAI\n");
    process.exitCode = 0;
  }
}

main()
  .catch((e) => {
    console.error("\nERROR TAK TERTANGANI:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
