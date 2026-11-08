import type { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { sendSuccess } from "../../utils/response";

type DatabaseStatus = "connected" | "disconnected";

interface HealthData {
  status: "ok" | "degraded";
  database: DatabaseStatus;
  databaseLatencyMs: number | null;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  error?: string;
}

/**
 * GET /api/v1/health
 *
 * Membuktikan dua hal sekaligus:
 *  - proses HTTP hidup dan konfigurasi environment valid;
 *  - koneksi database benar-benar dapat dipakai (bukan sekadar "config ada").
 *
 * Status 200 bila database terhubung, 503 bila tidak.
 */
export async function getHealth(_req: Request, res: Response): Promise<void> {
  const mulai = process.hrtime.bigint();
  let database: DatabaseStatus = "disconnected";
  let latencyMs: number | null = null;
  let pesanKesalahan: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
    latencyMs = Math.round(Number(process.hrtime.bigint() - mulai) / 1_000_000);
  } catch (error) {
    pesanKesalahan =
      error instanceof Error ? error.message : "Kesalahan tidak dikenal";
  }

  const data: HealthData = {
    status: database === "connected" ? "ok" : "degraded",
    database,
    databaseLatencyMs: latencyMs,
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  if (pesanKesalahan !== undefined) {
    data.error = pesanKesalahan;
  }

  sendSuccess(res, data, database === "connected" ? 200 : 503);
}
