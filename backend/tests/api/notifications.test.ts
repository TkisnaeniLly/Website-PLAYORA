import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "RahasiaNotif123!";
type Agent = ReturnType<typeof klien>;

let saya: Agent;
let csrfSaya = "";
let idSaya = "";
let orangLain: Agent;
let csrfOrangLain = "";
let idOrangLain = "";

beforeAll(async () => {
  await bersihkanData();

  const stempel = Date.now();

  saya = klien();
  csrfSaya = await ambilCsrf(saya);
  await kirim(saya, "post", "/api/v1/auth/register", csrfSaya, {
    name: "Pemilik Notifikasi",
    username: `notif_${stempel}`,
    email: `notif.${stempel}@playora.test`,
    password: SANDI,
  }).expect(201);
  idSaya = (await prisma.user.findUniqueOrThrow({ where: { email: `notif.${stempel}@playora.test` } })).id;
  csrfSaya = await ambilCsrf(saya);

  orangLain = klien();
  csrfOrangLain = await ambilCsrf(orangLain);
  await kirim(orangLain, "post", "/api/v1/auth/register", csrfOrangLain, {
    name: "Orang Lain Notifikasi",
    username: `notif_lain_${stempel}`,
    email: `notif.lain.${stempel}@playora.test`,
    password: SANDI,
  }).expect(201);
  idOrangLain = (await prisma.user.findUniqueOrThrow({ where: { email: `notif.lain.${stempel}@playora.test` } })).id;
  csrfOrangLain = await ambilCsrf(orangLain);

  await prisma.notification.createMany({
    data: [
      {
        userId: idSaya,
        type: "SUBMISSION_CREATED",
        title: "Pengajuan terkirim",
        message: "Pengajuan Anda terkirim.",
      },
      {
        userId: idSaya,
        type: "RESULT_APPROVED",
        title: "Hasil disetujui",
        message: "Hasil peringkat 1 disetujui.",
      },
      {
        userId: idSaya,
        type: "RESULT_REJECTED",
        title: "Hasil ditolak",
        message: "Hasil peringkat 2 ditolak.",
      },
      {
        userId: idOrangLain,
        type: "SUBMISSION_APPROVED",
        title: "Milik orang lain",
        message: "Tidak boleh terlihat.",
      },
    ],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/me/notifications", () => {
  it("menolak tanpa sesi", async () => {
    await klien().get("/api/v1/me/notifications").expect(401);
  });

  it("hanya mengembalikan notifikasi milik sendiri", async () => {
    const res = await saya.get("/api/v1/me/notifications").expect(200);

    const judul = res.body.data.items.map((n: { title: string }) => n.title);
    expect(judul).toContain("Pengajuan terkirim");
    expect(judul).not.toContain("Milik orang lain");
    expect(res.body.meta.total).toBe(3);
  });

  it("menyertakan jumlah belum dibaca", async () => {
    const res = await saya.get("/api/v1/me/notifications").expect(200);
    expect(res.body.data.unreadCount).toBe(3);
  });

  it("memfilter hanya yang belum dibaca", async () => {
    const res = await saya.get("/api/v1/me/notifications?unreadOnly=true").expect(200);
    expect(res.body.data.items.every((n: { isRead: boolean }) => !n.isRead)).toBe(true);
  });

  it("membagi hasil dengan pagination", async () => {
    const res = await saya.get("/api/v1/me/notifications?limit=2&page=1").expect(200);

    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 2, total: 3 });
  });

  it("mengurutkan dari yang terbaru", async () => {
    const res = await saya.get("/api/v1/me/notifications").expect(200);
    const tanggal = res.body.data.items.map((n: { createdAt: string }) =>
      new Date(n.createdAt).getTime(),
    );
    expect(tanggal).toEqual([...tanggal].sort((a, b) => b - a));
  });
});

describe("GET /api/v1/me/notifications/unread-count", () => {
  it("mengembalikan jumlah belum dibaca", async () => {
    const res = await saya.get("/api/v1/me/notifications/unread-count").expect(200);
    expect(res.body.data.unreadCount).toBe(3);
  });

  it("tidak menghitung notifikasi pengguna lain", async () => {
    const res = await orangLain.get("/api/v1/me/notifications/unread-count").expect(200);
    expect(res.body.data.unreadCount).toBe(1);
  });
});

describe("PATCH /api/v1/me/notifications/:id/read", () => {
  it("menandai satu notifikasi sebagai dibaca", async () => {
    const daftar = await saya.get("/api/v1/me/notifications").expect(200);
    const target = daftar.body.data.items.find((n: { isRead: boolean }) => !n.isRead);

    await kirim(saya, "patch", `/api/v1/me/notifications/${target.id}/read`, csrfSaya).expect(200);

    const sesudah = await prisma.notification.findUniqueOrThrow({
      where: { id: target.id },
      select: { isRead: true },
    });
    expect(sesudah.isRead).toBe(true);
  });

  it("menolak menandai notifikasi milik pengguna lain (404)", async () => {
    const daftar = await saya.get("/api/v1/me/notifications").expect(200);
    const milikSaya = daftar.body.data.items[0];

    const res = await kirim(
      orangLain,
      "patch",
      `/api/v1/me/notifications/${milikSaya.id}/read`,
      csrfOrangLain,
    );

    expect(res.status).toBe(404);
  });

  it("menolak id yang tidak ada", async () => {
    const res = await kirim(
      saya,
      "patch",
      "/api/v1/me/notifications/ffffffff-ffff-4fff-8fff-ffffffffffff/read",
      csrfSaya,
    );
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/me/notifications/read-all", () => {
  it("menandai semua notifikasi sendiri sebagai dibaca", async () => {
    const res = await kirim(
      saya,
      "patch",
      "/api/v1/me/notifications/read-all",
      csrfSaya,
    ).expect(200);

    expect(res.body.data.jumlah).toBe(2);

    const sisa = await prisma.notification.count({ where: { userId: idSaya, isRead: false } });
    expect(sisa).toBe(0);

    const cek = await saya.get("/api/v1/me/notifications/unread-count").expect(200);
    expect(cek.body.data.unreadCount).toBe(0);
  });

  it("tidak menyentuh notifikasi pengguna lain", async () => {
    const lain = await prisma.notification.count({
      where: { userId: idOrangLain, isRead: false },
    });
    expect(lain).toBe(1);
  });

  it("aman dipanggil berkali-kali", async () => {
    const res = await kirim(saya, "patch", "/api/v1/me/notifications/read-all", csrfSaya).expect(200);
    expect(res.body.data.jumlah).toBe(0);
  });
});

describe("Notifikasi hasil pertandingan", () => {
  it("menyimpan tipe RESULT_APPROVED dan RESULT_REJECTED", async () => {
    const jenis = await prisma.notification.findMany({
      where: { userId: idSaya },
      select: { type: true },
    });
    const daftar = jenis.map((n) => n.type);

    expect(daftar).toContain("RESULT_APPROVED");
    expect(daftar).toContain("RESULT_REJECTED");
  });
});
