/**
 * Verifikasi struktur database PLAYORA terhadap kontrak skema MVP.
 *
 * Skrip ini dijalankan SEBELUM migration (harus GAGAL) dan SESUDAH migration
 * (harus LULUS). Semua pemeriksaan membaca information_schema, bukan asumsi.
 *
 * Jalankan: node scripts/verify-schema.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TABEL_WAJIB = [
  "users",
  "games",
  "platforms",
  "game_platforms",
  "articles",
  "tournament_submissions",
  "tournament_reviews",
  "tournaments",
  "tournament_results",
  "user_games",
  "bookmarks",
  "notifications",
  "tournament_result_reviews",
  "tournament_change_requests",
  "community_posts",
  "community_comments",
  "community_post_likes",
  "discord_rooms",
];

// Fitur yang ditunda TIDAK boleh punya tabel pada MVP.
const TABEL_TERLARANG = [
  "reports",
  "tournament_managers",
  "game_reviews",
  "collections",
  "follows",
  "friendships",
  "messages",
];

const KOLOM_WAJIB = [
  { tabel: "users", kolom: "token_version", tipe: "int" },
  { tabel: "games", kolom: "status", tipe: "enum" },
  { tabel: "tournament_submissions", kolom: "team_count", tipe: "int" },
  { tabel: "tournament_submissions", kolom: "registration_method", tipe: "varchar" },
  { tabel: "tournaments", kolom: "team_count", tipe: "int" },
  { tabel: "tournaments", kolom: "registration_method", tipe: "varchar" },
  { tabel: "tournament_results", kolom: "status", tipe: "enum" },
  { tabel: "tournament_results", kolom: "reviewed_by", tipe: "char" },
  { tabel: "tournament_results", kolom: "admin_note", tipe: "text" },
  { tabel: "tournament_result_reviews", kolom: "action", tipe: "enum" },
  { tabel: "tournament_change_requests", kolom: "payload", tipe: "text" },
  { tabel: "tournament_change_requests", kolom: "status", tipe: "enum" },
  { tabel: "community_posts", kolom: "category", tipe: "enum" },
  { tabel: "community_posts", kolom: "is_hidden", tipe: "tinyint" },
  { tabel: "discord_rooms", kolom: "status", tipe: "enum" },
  { tabel: "discord_rooms", kolom: "invite_url", tipe: "varchar" },
  { tabel: "community_comments", kolom: "body", tipe: "text" },
];

const UNIQUE_WAJIB = [
  { tabel: "users", kolom: ["username"] },
  { tabel: "users", kolom: ["email"] },
  { tabel: "games", kolom: ["slug"] },
  { tabel: "platforms", kolom: ["name"] },
  { tabel: "articles", kolom: ["slug"] },
  { tabel: "tournaments", kolom: ["slug"] },
  { tabel: "tournaments", kolom: ["submission_id"] },
  { tabel: "tournament_results", kolom: ["tournament_id", "position"] },
  { tabel: "user_games", kolom: ["user_id", "game_id"] },
  { tabel: "bookmarks", kolom: ["user_id", "article_id"] },
  { tabel: "community_post_likes", kolom: ["post_id", "user_id"] },
];

const FK_WAJIB = [
  { tabel: "game_platforms", kolom: "game_id", ke: "games", onDelete: "CASCADE" },
  { tabel: "game_platforms", kolom: "platform_id", ke: "platforms", onDelete: "CASCADE" },
  { tabel: "articles", kolom: "author_id", ke: "users", onDelete: "RESTRICT" },
  { tabel: "articles", kolom: "game_id", ke: "games", onDelete: "SET NULL" },
  { tabel: "tournament_submissions", kolom: "submitted_by", ke: "users", onDelete: "RESTRICT" },
  { tabel: "tournament_submissions", kolom: "game_id", ke: "games", onDelete: "RESTRICT" },
  { tabel: "tournament_submissions", kolom: "reviewed_by", ke: "users", onDelete: "SET NULL" },
  { tabel: "tournament_reviews", kolom: "submission_id", ke: "tournament_submissions", onDelete: "CASCADE" },
  { tabel: "tournament_reviews", kolom: "admin_id", ke: "users", onDelete: "RESTRICT" },
  { tabel: "tournament_change_requests", kolom: "tournament_id", ke: "tournaments", onDelete: "CASCADE" },
  { tabel: "tournament_change_requests", kolom: "requested_by", ke: "users", onDelete: "RESTRICT" },
  { tabel: "tournament_change_requests", kolom: "reviewed_by", ke: "users", onDelete: "SET NULL" },
  { tabel: "community_posts", kolom: "author_id", ke: "users", onDelete: "CASCADE" },
  { tabel: "community_comments", kolom: "post_id", ke: "community_posts", onDelete: "CASCADE" },
  { tabel: "community_comments", kolom: "author_id", ke: "users", onDelete: "CASCADE" },
  { tabel: "community_post_likes", kolom: "post_id", ke: "community_posts", onDelete: "CASCADE" },
  { tabel: "community_post_likes", kolom: "user_id", ke: "users", onDelete: "CASCADE" },
  { tabel: "discord_rooms", kolom: "submitted_by", ke: "users", onDelete: "CASCADE" },
  { tabel: "discord_rooms", kolom: "reviewed_by", ke: "users", onDelete: "SET NULL" },
  { tabel: "discord_rooms", kolom: "game_id", ke: "games", onDelete: "SET NULL" },
  { tabel: "tournaments", kolom: "submission_id", ke: "tournament_submissions", onDelete: "SET NULL" },
  { tabel: "tournaments", kolom: "game_id", ke: "games", onDelete: "RESTRICT" },
  { tabel: "tournaments", kolom: "manager_id", ke: "users", onDelete: "SET NULL" },
  { tabel: "tournaments", kolom: "published_by", ke: "users", onDelete: "SET NULL" },
  { tabel: "tournament_results", kolom: "tournament_id", ke: "tournaments", onDelete: "CASCADE" },
  { tabel: "tournament_results", kolom: "updated_by", ke: "users", onDelete: "SET NULL" },
  { tabel: "user_games", kolom: "user_id", ke: "users", onDelete: "CASCADE" },
  { tabel: "user_games", kolom: "game_id", ke: "games", onDelete: "CASCADE" },
  { tabel: "bookmarks", kolom: "user_id", ke: "users", onDelete: "CASCADE" },
  { tabel: "bookmarks", kolom: "article_id", ke: "articles", onDelete: "CASCADE" },
  { tabel: "notifications", kolom: "user_id", ke: "users", onDelete: "CASCADE" },
  { tabel: "tournament_results", kolom: "reviewed_by", ke: "users", onDelete: "SET NULL" },
  { tabel: "tournament_results", kolom: "submitted_by", ke: "users", onDelete: "SET NULL" },
  {
    tabel: "tournament_result_reviews",
    kolom: "result_id",
    ke: "tournament_results",
    onDelete: "CASCADE",
  },
];

const ENUM_WAJIB = [
  { tabel: "users", kolom: "role", nilai: ["USER", "ADMIN"] },
  { tabel: "games", kolom: "status", nilai: ["DRAFT", "PUBLISHED"] },
  { tabel: "articles", kolom: "status", nilai: ["DRAFT", "PUBLISHED"] },
  { tabel: "articles", kolom: "category", nilai: ["NEWS", "UPDATE", "TIPS", "TUTORIAL", "ESPORTS"] },
  {
    tabel: "tournament_submissions",
    kolom: "status",
    nilai: ["PENDING", "NEEDS_REVISION", "APPROVED", "REJECTED"],
  },
  {
    tabel: "tournament_reviews",
    kolom: "decision",
    nilai: ["PENDING", "NEEDS_REVISION", "APPROVED", "REJECTED"],
  },
  {
    tabel: "notifications",
    kolom: "type",
    nilai: [
      "SUBMISSION_CREATED",
      "SUBMISSION_STATUS_CHANGED",
      "SUBMISSION_APPROVED",
      "SUBMISSION_REJECTED",
      "SUBMISSION_NEEDS_REVISION",
    ],
  },
  {
    tabel: "tournament_results",
    kolom: "status",
    nilai: ["PENDING_REVIEW", "APPROVED", "REJECTED"],
  },
  {
    tabel: "tournament_result_reviews",
    kolom: "action",
    nilai: ["SUBMITTED", "APPROVED", "REJECTED"],
  },
];

let gagal = 0;
let lulus = 0;

function ok(pesan) {
  lulus++;
  console.log(`  PASS  ${pesan}`);
}

function fail(pesan) {
  gagal++;
  console.log(`  FAIL  ${pesan}`);
}

async function main() {
  console.log("\n=== VERIFIKASI SKEMA DATABASE PLAYORA ===\n");

  // ---------------------------------------------------------------- tabel
  console.log("[1] Tabel wajib");
  const tabelAda = (
    await prisma.$queryRaw`
      SELECT TABLE_NAME AS nama
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `
  ).map((r) => String(r.nama));
  const himpunan = new Set(tabelAda);

  for (const tabel of TABEL_WAJIB) {
    if (himpunan.has(tabel)) ok(`tabel ${tabel} ada`);
    else fail(`tabel ${tabel} TIDAK ADA`);
  }

  // ------------------------------------------------- tabel fitur tertunda
  console.log("\n[2] Tidak ada tabel fitur tertunda");
  for (const tabel of TABEL_TERLARANG) {
    if (himpunan.has(tabel)) fail(`tabel terlarang ${tabel} DITEMUKAN`);
    else ok(`tabel ${tabel} tidak dibuat (benar)`);
  }

  // -------------------------------------------------------------- unique
  console.log("\n[3] Unique constraint");
  const statistik = await prisma.$queryRaw`
    SELECT TABLE_NAME AS tabel, INDEX_NAME AS idx, COLUMN_NAME AS kolom, SEQ_IN_INDEX AS urutan
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND NON_UNIQUE = 0
    ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
  `;

  const unikPerTabel = new Map();
  for (const baris of statistik) {
    const kunci = `${baris.tabel}::${baris.idx}`;
    if (!unikPerTabel.has(kunci)) unikPerTabel.set(kunci, []);
    unikPerTabel.get(kunci).push(String(baris.kolom));
  }

  for (const { tabel, kolom } of UNIQUE_WAJIB) {
    const cocok = [...unikPerTabel.entries()].some(
      ([kunci, daftar]) => kunci.startsWith(`${tabel}::`) && daftar.join(",") === kolom.join(","),
    );
    if (cocok) ok(`unique ${tabel}(${kolom.join(", ")})`);
    else fail(`unique ${tabel}(${kolom.join(", ")}) TIDAK ADA`);
  }

  // ------------------------------------------------------------ foreign key
  console.log("\n[4] Foreign key + aturan ON DELETE");
  let fkNyata = [];
  try {
    fkNyata = await prisma.$queryRaw`
      SELECT
        kcu.TABLE_NAME AS tabel,
        kcu.COLUMN_NAME AS kolom,
        kcu.REFERENCED_TABLE_NAME AS ke,
        rc.DELETE_RULE AS hapus
      FROM information_schema.KEY_COLUMN_USAGE kcu
      JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
       AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE kcu.TABLE_SCHEMA = DATABASE()
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    `;
  } catch (e) {
    fail(`gagal membaca foreign key: ${e.message}`);
  }

  for (const wajib of FK_WAJIB) {
    const nyata = fkNyata.find(
      (f) => f.tabel === wajib.tabel && f.kolom === wajib.kolom,
    );
    if (!nyata) {
      fail(`FK ${wajib.tabel}.${wajib.kolom} TIDAK ADA`);
      continue;
    }
    if (nyata.ke !== wajib.ke) {
      fail(`FK ${wajib.tabel}.${wajib.kolom} menunjuk ${nyata.ke}, seharusnya ${wajib.ke}`);
      continue;
    }
    if (String(nyata.hapus).toUpperCase() !== wajib.onDelete) {
      fail(
        `FK ${wajib.tabel}.${wajib.kolom} ON DELETE=${nyata.hapus}, seharusnya ${wajib.onDelete}`,
      );
      continue;
    }
    ok(`FK ${wajib.tabel}.${wajib.kolom} -> ${wajib.ke} ON DELETE ${wajib.onDelete}`);
  }

  // ----------------------------------------------------------------- enum
  console.log("\n[5] Nilai enum");
  let kolomNyata = [];
  try {
    kolomNyata = await prisma.$queryRaw`
      SELECT TABLE_NAME AS tabel, COLUMN_NAME AS kolom, COLUMN_TYPE AS tipe
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
    `;
  } catch (e) {
    fail(`gagal membaca kolom: ${e.message}`);
  }

  for (const { tabel, kolom, nilai } of ENUM_WAJIB) {
    const nyata = kolomNyata.find((k) => k.tabel === tabel && k.kolom === kolom);
    if (!nyata) {
      fail(`kolom ${tabel}.${kolom} TIDAK ADA`);
      continue;
    }
    const tipe = String(nyata.tipe);
    if (!tipe.startsWith("enum(")) {
      fail(`${tabel}.${kolom} bertipe ${tipe}, bukan enum`);
      continue;
    }
    const kurang = nilai.filter((n) => !tipe.includes(`'${n}'`));
    if (kurang.length > 0) fail(`${tabel}.${kolom} kehilangan nilai: ${kurang.join(", ")}`);
    else ok(`enum ${tabel}.${kolom} lengkap (${nilai.length} nilai)`);
  }

  // --------------------------------------------------------------- ringkas
  console.log("\n[6] Kolom wajib");
  for (const { tabel, kolom, tipe } of KOLOM_WAJIB) {
    const nyata = kolomNyata.find((k) => k.tabel === tabel && k.kolom === kolom);
    if (!nyata) {
      fail(`kolom ${tabel}.${kolom} TIDAK ADA`);
      continue;
    }
    const tipeNyata = String(nyata.tipe).toLowerCase();
    if (tipeNyata.startsWith(tipe)) ok(`kolom ${tabel}.${kolom} bertipe ${tipe}`);
    else fail(`kolom ${tabel}.${kolom} bertipe ${tipeNyata}, seharusnya ${tipe}`);
  }

  console.log("\n=== RINGKASAN ===");
  console.log(`LULUS : ${lulus}`);
  console.log(`GAGAL : ${gagal}`);

  if (gagal > 0) {
    console.log("\nHASIL: SKEMA BELUM SESUAI KONTRAK\n");
    process.exitCode = 1;
  } else {
    console.log("\nHASIL: SKEMA SESUAI KONTRAK\n");
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
