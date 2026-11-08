import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame } from "../helpers/fixtures";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "Perubahan123!";
type Agent = ReturnType<typeof klien>;

let pengelola: Agent, csrfPengelola = "";
let orangLain: Agent, csrfOrangLain = "";
let admin: Agent, csrfAdmin = "";
let idPengelola = "";
let idAdmin = "";
let idTurnamen = "";

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

  pengelola = await daftar(`cr.${stempel}@playora.test`, `cr_${stempel}`, "Pengelola Uji");
  csrfPengelola = await ambilCsrf(pengelola);
  idPengelola = (
    await prisma.user.findUniqueOrThrow({ where: { email: `cr.${stempel}@playora.test` } })
  ).id;

  orangLain = await daftar(`cr.lain.${stempel}@playora.test`, `cr_lain_${stempel}`, "Orang Lain");
  csrfOrangLain = await ambilCsrf(orangLain);

  admin = await daftar(`cr.admin.${stempel}@playora.test`, `cr_admin_${stempel}`, "Admin Uji");
  idAdmin = (
    await prisma.user.findUniqueOrThrow({ where: { email: `cr.admin.${stempel}@playora.test` } })
  ).id;
  await prisma.user.update({ where: { id: idAdmin }, data: { role: "ADMIN" } });
  csrfAdmin = await ambilCsrf(admin);

  const game = await buatGame({ title: "Game Perubahan", genre: "MOBA" });
  const turnamen = await prisma.tournament.create({
    data: {
      gameId: game.id,
      managerId: idPengelola,
      title: "Turnamen Perubahan",
      slug: `turnamen-perubahan-${stempel}`,
      organizerName: "Penyelenggara Awal",
      description: "Deskripsi awal turnamen untuk pengujian perubahan informasi.",
      startDate: new Date("2027-06-01"),
      endDate: new Date("2027-06-03"),
      isPublished: true,
    },
    select: { id: true },
  });
  idTurnamen = turnamen.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.tournamentChangeRequest.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.tournament.update({
    where: { id: idTurnamen },
    data: { title: "Turnamen Perubahan", organizerName: "Penyelenggara Awal" },
  });
});

describe("Pengajuan perubahan turnamen", () => {
  it("menolak tamu", async () => {
    const res = await klien().post(`/api/v1/tournaments/${idTurnamen}/change-requests`).send({
      message: "Mohon ubah judul.",
      title: "Judul Baru",
    });
    expect([401, 403]).toContain(res.status);
  });

  it("pengguna lain mendapat 404, bukan 403", async () => {
    const res = await kirim(
      orangLain,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfOrangLain,
      { message: "Mohon ubah judul turnamen.", title: "Judul Bajakan" },
    );
    expect(res.status).toBe(404);
  });

  it("pengelola dapat mengajukan perubahan", async () => {
    const res = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Nama penyelenggara berubah.", organizerName: "Penyelenggara Baru" },
    );

    expect(res.status).toBe(201);
    expect(res.body.data.request.status).toBe("PENDING");

    const tersimpan = await prisma.tournamentChangeRequest.findMany();
    expect(tersimpan).toHaveLength(1);
    expect(JSON.parse(tersimpan[0]!.payload)).toEqual({ organizerName: "Penyelenggara Baru" });
  });

  it("menolak permintaan tanpa field perubahan (400)", async () => {
    const res = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Hanya alasan tanpa perubahan." },
    );
    expect(res.status).toBe(400);
  });

  it("menolak permintaan ganda saat masih menunggu (409)", async () => {
    await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah judul turnamen.", title: "Judul Satu" },
    ).expect(201);

    const res = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah lagi judulnya.", title: "Judul Dua" },
    );
    expect(res.status).toBe(409);
  });

  it("admin menyetujui dan perubahan diterapkan ke turnamen", async () => {
    const dibuat = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      {
        message: "Judul dan penyelenggara berubah.",
        title: "Turnamen Perubahan Baru",
        organizerName: "Penyelenggara Baru",
      },
    ).expect(201);

    const id = dibuat.body.data.request.id;

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/change-requests/${id}/decision`,
      csrfAdmin,
      { decision: "APPROVED", note: "Sesuai dokumen." },
    );
    expect(res.status).toBe(200);

    const turnamen = await prisma.tournament.findUniqueOrThrow({
      where: { id: idTurnamen },
      select: { title: true, organizerName: true },
    });
    expect(turnamen.title).toBe("Turnamen Perubahan Baru");
    expect(turnamen.organizerName).toBe("Penyelenggara Baru");

    const notif = await prisma.notification.findMany({ where: { userId: idPengelola } });
    expect(notif).toHaveLength(1);
    expect(notif[0]!.type).toBe("CHANGE_REQUEST_APPROVED");
  });

  it("penolakan wajib menyertakan catatan (400)", async () => {
    const dibuat = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah judul.", title: "Judul Ditolak" },
    ).expect(201);

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/change-requests/${dibuat.body.data.request.id}/decision`,
      csrfAdmin,
      { decision: "REJECTED" },
    );
    expect(res.status).toBe(400);
  });

  it("penolakan tidak mengubah turnamen", async () => {
    const dibuat = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah judul.", title: "Judul Tidak Disetujui" },
    ).expect(201);

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/change-requests/${dibuat.body.data.request.id}/decision`,
      csrfAdmin,
      { decision: "REJECTED", note: "Belum sesuai ketentuan." },
    ).expect(200);

    const turnamen = await prisma.tournament.findUniqueOrThrow({
      where: { id: idTurnamen },
      select: { title: true },
    });
    expect(turnamen.title).toBe("Turnamen Perubahan");

    const notif = await prisma.notification.findMany({ where: { userId: idPengelola } });
    expect(notif[0]!.type).toBe("CHANGE_REQUEST_REJECTED");
  });

  it("permintaan yang sudah diputuskan tidak bisa diputuskan ulang (409)", async () => {
    const dibuat = await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah judul.", title: "Judul Sekali" },
    ).expect(201);

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/change-requests/${dibuat.body.data.request.id}/decision`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/change-requests/${dibuat.body.data.request.id}/decision`,
      csrfAdmin,
      { decision: "REJECTED", note: "Ulang." },
    );
    expect(res.status).toBe(409);
  });

  it("admin dapat melihat antrean permintaan", async () => {
    await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah judul.", title: "Judul Antrean" },
    ).expect(201);

    const res = await admin.get("/api/v1/admin/change-requests?status=PENDING");
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].payload.title).toBe("Judul Antrean");
  });

  it("pengguna biasa tidak boleh membuka antrean admin (403)", async () => {
    const res = await pengelola.get("/api/v1/admin/change-requests");
    expect(res.status).toBe(403);
  });

  it("pengelola dapat melihat riwayat permintaannya", async () => {
    await kirim(
      pengelola,
      "post",
      `/api/v1/tournaments/${idTurnamen}/change-requests`,
      csrfPengelola,
      { message: "Ubah judul.", title: "Judul Riwayat" },
    ).expect(201);

    const res = await pengelola.get(`/api/v1/tournaments/${idTurnamen}/change-requests`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });
});
