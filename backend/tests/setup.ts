import path from "node:path";
import dotenv from "dotenv";

// Wajib dijalankan sebelum modul aplikasi diimpor: env.ts membaca NODE_ENV
// untuk memutuskan apakah berkas .env pengembangan ikut dimuat.
dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
  override: true,
  quiet: true,
});

process.env.NODE_ENV = "test";

process.env.DATABASE_URL = process.env.DATABASE_URL?.includes("_test")
  ? process.env.DATABASE_URL
  : "mysql://root@localhost:3306/playora_test";
