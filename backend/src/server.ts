import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`[PLAYORA] API berjalan di http://localhost:${env.PORT}/api/v1`);
  console.log(`[PLAYORA] Lingkungan: ${env.NODE_ENV}`);
});

/**
 * Penutupan rapi: hentikan penerimaan koneksi baru, lalu lepaskan pool database.
 */
async function shutdown(sinyal: string): Promise<void> {
  console.log(`\n[PLAYORA] Menerima ${sinyal}, menutup server...`);

  server.close(() => {
    console.log("[PLAYORA] Server HTTP ditutup.");
  });

  try {
    await prisma.$disconnect();
    console.log("[PLAYORA] Koneksi database dilepas.");
  } catch (error) {
    console.error("[PLAYORA] Gagal melepas koneksi database:", error);
  }

  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
