import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "LaporanUji123!";
type Agent = ReturnType<typeof klien>;

let admin: Agent;
let pengguna: Agent;

async function daftar(email: string, username: string, name: string) {
  const agent = klien();
  const csrf = await ambilCsrf(agent);
  await kirim(agent, "post", "/api/v1/auth/register", csrf, {
    name,
    username,
    email,
    password: SANDI,
  }).expect(201);
  return agent;
}

beforeAll(async () => {
  await bersihkanData();
  const stempel = Date.now();

  const emailAdmin = `lap.admin.${stempel}@playora.test`;
  admin = await daftar(emailAdmin, `lap_admin_${stempel}`, "Admin Laporan");
  await prisma.user.update({ where: { email: emailAdmin }, data: { role: "ADMIN" } });
  await kirim(admin, "post", "/api/v1/auth/login", await ambilCsrf(admin), {
    email: emailAdmin,
    password: SANDI,
  }).expect(200);

  pengguna = await daftar(`lap.user.${stempel}@playora.test`, `lap_user_${stempel}`, "Pengguna Laporan");

  const game = await prisma.game.create({
    data: {
      title: "Game Laporan",
      slug: `game-laporan-${stempel}`,
      description: "Game untuk pengujian laporan.",
      genre: "MOBA",
      status: "PUBLISHED",
    },
    select: { id: true },
  });

  const idPengguna = (
    await prisma.user.findUniqueOrThrow({ where: { email: `lap.user.${stempel}@playora.test` } })
  ).id;

  await prisma.article.create({
    data: {
      title: "Artikel Laporan",
      slug: `artikel-laporan-${stempel}`,
      content: "Isi artikel laporan statistik admin yang cukup panjang.",
      category: "NEWS",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: idPengguna,
      gameId: game.id,
    },
  });

  await prisma.tournament.create({
    data: {
      gameId: game.id,
      managerId: idPengguna,
      title: "Turnamen Laporan",
      slug: `turnamen-laporan-${stempel}`,
      organizerName: "Penyelenggara Laporan",
      description: "Turnamen untuk pengujian laporan.",
      startDate: new Date("2027-01-01"),
      endDate: new Date("2027-01-03"),
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.discordRoom.create({
    data: {
      submittedBy: idPengguna,
      name: "Ruang Laporan",
      inviteUrl: `https://discord.gg/laporan-${stempel}`,
      description: "Ruang Discord untuk pengujian laporan statistik.",
      status: "APPROVED",
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/admin/reports", () => {
  it("menolak tamu", async () => {
    const res = await klien().get("/api/v1/admin/reports");
    expect([401, 403]).toContain(res.status);
  });

  it("menolak pengguna biasa", async () => {
    const res = await pengguna.get("/api/v1/admin/reports");
    expect(res.status).toBe(403);
  });

  it("admin menerima ringkasan konten, pengguna, dan ruang Discord", async () => {
    const res = await admin.get("/api/v1/admin/reports").expect(200);
    const data = res.body.data;

    expect(data.content.games.total).toBe(1);
    expect(data.content.games.published).toBe(1);
    expect(data.content.articles.total).toBe(1);
    expect(data.content.tournaments.total).toBe(1);
    expect(data.content.discordRooms.total).toBe(1);
    expect(data.content.discordRooms.approved).toBe(1);
    expect(data.users.total).toBe(2);
    expect(data.users.admins).toBe(1);
    expect(data.users.regular).toBe(1);
    expect(data.users.newLast30Days).toBe(2);
  });

  it("menyertakan seri aktivitas harian 14 hari yang berurutan", async () => {
    const res = await admin.get("/api/v1/admin/reports").expect(200);
    const seri = res.body.data.activity;

    expect(seri).toHaveLength(14);
    expect(seri[13].users).toBeGreaterThanOrEqual(2);
    expect(seri.every((titik: { date: string }) => /^\d{4}-\d{2}-\d{2}$/.test(titik.date))).toBe(
      true,
    );

    const tanggal = seri.map((titik: { date: string }) => titik.date);
    expect([...tanggal].sort()).toEqual(tanggal);
  });

  it("menyertakan peringkat game populer dan kontributor teratas", async () => {
    const res = await admin.get("/api/v1/admin/reports").expect(200);
    const data = res.body.data;

    expect(Array.isArray(data.topGames)).toBe(true);
    expect(data.topGames[0].title).toBe("Game Laporan");
    expect(Array.isArray(data.topContributors)).toBe(true);
    expect(data.topContributors[0].name).toBe("Pengguna Laporan");
    expect(data.topContributors[0].articles).toBe(1);
  });
});
