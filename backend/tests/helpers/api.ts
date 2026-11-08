import request from "supertest";
import type { Response } from "supertest";
import { app } from "../../src/app";

export const ORIGIN_UJI = "http://localhost:5173";

export function bacaCookie(res: Response, nama: string): string | null {
  const mentah = res.headers["set-cookie"];
  if (!mentah) return null;

  const daftar = Array.isArray(mentah) ? mentah : [mentah];
  for (const baris of daftar) {
    const pasangan = baris.split(";")[0] ?? "";
    const posisi = pasangan.indexOf("=");
    if (posisi < 0) continue;
    if (pasangan.slice(0, posisi).trim() === nama) {
      return decodeURIComponent(pasangan.slice(posisi + 1).trim());
    }
  }
  return null;
}

export function klien() {
  return request.agent(app);
}

export async function ambilCsrf(agent: ReturnType<typeof klien>): Promise<string> {
  const res = await agent.get("/api/v1/auth/csrf").set("Origin", ORIGIN_UJI).expect(200);
  const token = bacaCookie(res, "playora_csrf");
  if (!token) {
    throw new Error("Cookie CSRF tidak diterbitkan server");
  }
  return token;
}

export function kirim(
  agent: ReturnType<typeof klien>,
  metode: "post" | "patch" | "delete",
  path: string,
  csrf: string,
  body?: unknown,
) {
  const permintaan = agent[metode](path)
    .set("Origin", ORIGIN_UJI)
    .set("X-CSRF-Token", csrf);

  return body === undefined ? permintaan : permintaan.send(body);
}
