import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "UnggahSandi123!";

let pengguna: ReturnType<typeof klien>, csrfPengguna = "";

beforeAll(async () => {
  await bersihkanData();

  const stempel = Date.now();
  pengguna = klien();
  const csrf = await ambilCsrf(pengguna);
  await kirim(pengguna, "post", "/api/v1/auth/register", csrf, {
    name: "Pengguna Unggah",
    username: `unggah_${stempel}`,
    email: `unggah.${stempel}@playora.test`,
    password: SANDI,
  }).expect(201);
  csrfPengguna = await ambilCsrf(pengguna);
});

afterAll(async () => {
  await prisma.$disconnect();
});

const DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("Unggah gambar (Cloudinary)", () => {
  it("menolak tamu tanpa sesi", async () => {
    const res = await klien().post("/api/v1/me/uploads/avatar").send({ dataUrl: DATA_URL });
    expect([401, 403]).toContain(res.status);
  });

  it("melaporkan status konfigurasi unggah", async () => {
    const res = await pengguna.get("/api/v1/me/uploads/status");
    expect(res.status).toBe(200);
    expect(typeof res.body.data.aktif).toBe("boolean");
  });

  it("menolak data gambar yang bukan data URL", async () => {
    const res = await kirim(pengguna, "post", "/api/v1/me/uploads/avatar", csrfPengguna, {
      dataUrl: "bukan-data-url",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("menolak format gambar di luar daftar yang diizinkan", async () => {
    const res = await kirim(pengguna, "post", "/api/v1/me/uploads/avatar", csrfPengguna, {
      dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/tidak didukung/i);
  });

  it("menolak berkas yang bukan gambar sama sekali", async () => {
    const res = await kirim(pengguna, "post", "/api/v1/me/uploads/avatar", csrfPengguna, {
      dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMC9L",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/tidak dikenali/i);
  });

  it("menolak unggahan tanpa kredensial Cloudinary dengan pesan jelas", async () => {
    const status = await pengguna.get("/api/v1/me/uploads/status");
    if (status.body.data.aktif === true) {
      return;
    }

    const res = await kirim(pengguna, "post", "/api/v1/me/uploads/avatar", csrfPengguna, {
      dataUrl: DATA_URL,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/belum dikonfigurasi/i);
  });

  it("admin dapat mengunggah berkas umum ke folder yang diizinkan", async () => {
    const stempel = Date.now();
    const admin = klien();
    const csrf = await ambilCsrf(admin);
    await kirim(admin, "post", "/api/v1/auth/register", csrf, {
      name: "Admin Unggah",
      username: `admin_unggah_${stempel}`,
      email: `admin_unggah.${stempel}@playora.test`,
      password: SANDI,
    }).expect(201);
    const akun = await prisma.user.findUniqueOrThrow({
      where: { email: `admin_unggah.${stempel}@playora.test` },
      select: { id: true },
    });
    await prisma.user.update({ where: { id: akun.id }, data: { role: "ADMIN" } });

    const csrfBaru = await ambilCsrf(admin);
    const res = await kirim(admin, "post", "/api/v1/admin/uploads", csrfBaru, {
      dataUrl: DATA_URL,
      folder: "playora/cover",
    });

    const status = await admin.get("/api/v1/me/uploads/status");
    if (status.body.data.aktif === true) {
      expect([200, 201]).toContain(res.status);
      expect(res.body.data.url).toMatch(/^https:\/\//);
    } else {
      expect(res.status).toBe(400);
    }
  });
});
