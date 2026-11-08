import { PrismaClient } from "@prisma/client";
import { isDevelopment } from "./env";

// Satu instance PrismaClient per proses. Saat `tsx watch` memuat ulang modul,
// instance lama dipakai kembali agar koneksi tidak menumpuk.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDevelopment ? ["warn", "error"] : ["error"],
  });

if (isDevelopment) {
  globalForPrisma.prisma = prisma;
}
