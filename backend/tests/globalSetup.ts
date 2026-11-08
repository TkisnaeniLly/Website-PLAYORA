/**
 * Menyiapkan database khusus pengujian.
 *
 * Basis data pengujian dipisahkan dari `playora_db` agar menjalankan test tidak
 * pernah menyentuh data pengembangan. Database dibuat bila belum ada, lalu
 * seluruh migration diterapkan.
 *
 * Catatan: pada sebagian environment, `prisma migrate deploy` keluar dengan kode 0
 * tanpa benar-benar menerapkan migration. Karena itu setelahnya kami memverifikasi
 * daftar tabel dan menerapkan SQL migration yang belum tercatat secara langsung.
 */
import path from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

const AKAR_BACKEND = path.resolve(__dirname, "..");
const BERKAS_ENV_UJI = path.join(AKAR_BACKEND, ".env.test");
const AKAR_MIGRASI = path.join(AKAR_BACKEND, "prisma", "migrations");

const DDL_MIGRATIONS = `CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`checksum\` VARCHAR(64) NOT NULL,
  \`finished_at\` DATETIME(3) NULL,
  \`migration_name\` VARCHAR(255) NOT NULL,
  \`logs\` TEXT NULL,
  \`rolled_back_at\` DATETIME(3) NULL,
  \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`applied_steps_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;

function daftarMigrasi(): string[] {
  if (!existsSync(AKAR_MIGRASI)) return [];
  return readdirSync(AKAR_MIGRASI, { withFileTypes: true })
    .filter((entri) => entri.isDirectory())
    .map((entri) => entri.name)
    .sort();
}

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: BERKAS_ENV_UJI, override: true, quiet: true });

  const dasar = process.env.DATABASE_URL;
  if (!dasar) {
    throw new Error("DATABASE_URL untuk pengujian tidak ditemukan di .env.test");
  }

  const url = new URL(dasar);
  const namaDatabase = url.pathname.replace(/^\//, "");
  if (!namaDatabase) {
    throw new Error("DATABASE_URL pengujian harus menyertakan nama database");
  }
  if (!namaDatabase.endsWith("_test")) {
    throw new Error(
      `Pengaman: nama database pengujian harus berakhiran "_test", bukan "${namaDatabase}"`,
    );
  }

  const opsi = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };

  const pembuat = await createConnection(opsi);
  await pembuat.query(
    `CREATE DATABASE IF NOT EXISTS \`${namaDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await pembuat.end();

  try {
    execSync("npx prisma migrate deploy", {
      cwd: AKAR_BACKEND,
      stdio: "pipe",
      env: { ...process.env, DATABASE_URL: dasar },
    });
  } catch {
    // Diabaikan: verifikasi di bawah akan menerapkan migration yang tertinggal.
  }

  const koneksi = await createConnection({ ...opsi, database: namaDatabase, multipleStatements: true });
  await koneksi.query(DDL_MIGRATIONS);

  const [tercatat] = await koneksi.query<Array<{ migration_name: string }>>(
    "SELECT migration_name FROM `_prisma_migrations` WHERE finished_at IS NOT NULL",
  );
  const sudah = new Set(tercatat.map((baris) => baris.migration_name));

  let diterapkan = 0;
  for (const nama of daftarMigrasi()) {
    if (sudah.has(nama)) continue;

    const berkas = path.join(AKAR_MIGRASI, nama, "migration.sql");
    if (!existsSync(berkas)) continue;

    const sql = readFileSync(berkas, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");

    try {
      await koneksi.query(sql);
    } catch (error) {
      const pesan = error instanceof Error ? error.message : String(error);
      if (!/already exists|Duplicate/i.test(pesan)) {
        await koneksi.end();
        throw new Error(`Gagal menerapkan migration ${nama}: ${pesan}`);
      }
    }

    await koneksi.query(
      `INSERT INTO \`_prisma_migrations\`
         (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES (?, ?, NOW(3), ?, NULL, NULL, NOW(3), 1)`,
      [randomUUID(), checksum, nama],
    );
    diterapkan += 1;
  }

  await koneksi.end();

  if (diterapkan > 0) {
    console.log(`[test] ${diterapkan} migration diterapkan langsung ke ${namaDatabase}`);
  }
  console.log(`[test] Database pengujian siap: ${namaDatabase}`);
}
