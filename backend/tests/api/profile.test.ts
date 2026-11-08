import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame } from "../helpers/fixtures";
import { ambilCsrf, bacaCookie, klien, kirim } from "../helpers/api";

const SANDI = "RahasiaProfil123!";
const SANDI_BARU = "RahasiaProfilBaru456!";
type Agent = ReturnType<typeof klien>;

let agent: Agent;
let csrf = "";
let email = "";
let userId = "";

beforeAll(async () => {
  await bersihkanData();

  const stempel = Date.now();
  email = `profil.${stempel}@playora.test`;
  agent = klien();
  csrf = await ambilCsrf(agent);

  await kirim(agent, "post", "/api/v1/auth/register", csrf, {
    name: "Pengguna Profil",
    username: `profil_${stempel}`,
    email,
    password: SANDI,
  }).expect(201);

  const pengguna = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
  userId = pengguna.id;

  csrf = await ambilCsrf(agent);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/me/profile", () => {
  it("menolak tanpa sesi", async () => {
    const tamu = klien();
    await tamu.get("/api/v1/me/profile").expect(401);
  });

  it("mengembalikan profil tanpa passwordHash", async () => {
    const res = await agent.get("/api/v1/me/profile").expect(200);

    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
    expect(res.body.data.user).not.toHaveProperty("tokenVersion");
  });
});

describe("PATCH /api/v1/me/profile", () => {
  it("memperbarui nama dan bio", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile", csrf, {
      name: "Nama Baru Profil",
      bio: "Bio baru untuk pengujian.",
    }).expect(200);

    expect(res.body.data.user.name).toBe("Nama Baru Profil");
    expect(res.body.data.user.bio).toBe("Bio baru untuk pengujian.");

    const tersimpan = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, bio: true },
    });
    expect(tersimpan.name).toBe("Nama Baru Profil");
  });

  it("mengosongkan bio dengan string kosong menjadi null", async () => {
    await kirim(agent, "patch", "/api/v1/me/profile", csrf, { bio: "" }).expect(200);

    const tersimpan = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { bio: true },
    });
    expect(tersimpan.bio).toBeNull();
  });

  it("menolak username duplikat dengan 409", async () => {
    const lain = await prisma.user.create({
      data: {
        name: "Pengguna Lain",
        username: `lain_${Date.now()}`,
        email: `lain.${Date.now()}@playora.test`,
        passwordHash: "$2a$08$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
      },
      select: { username: true },
    });

    const res = await kirim(agent, "patch", "/api/v1/me/profile", csrf, {
      username: lain.username,
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("menolak username tidak valid", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile", csrf, {
      username: "Huruf Besar!",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("menolak URL avatar yang bukan http", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile", csrf, {
      avatarUrl: "javascript:alert(1)",
    });

    expect(res.status).toBe(400);
  });

  it("menolak permintaan tanpa perubahan", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile", csrf, {});
    expect(res.status).toBe(400);
  });

  it("menolak pengguna lain mengubah profil (tanpa sesi)", async () => {
    const tamu = klien();
    const csrfTamu = await ambilCsrf(tamu);
    const res = await kirim(tamu, "patch", "/api/v1/me/profile", csrfTamu, {
      name: "Penyusup",
    });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/me/password", () => {
  it("menolak bila kata sandi saat ini salah", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile/password", csrf, {
      currentPassword: "SalahSekali123!",
      newPassword: SANDI_BARU,
      confirmPassword: SANDI_BARU,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe("currentPassword");
  });

  it("menolak bila konfirmasi tidak cocok", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile/password", csrf, {
      currentPassword: SANDI,
      newPassword: SANDI_BARU,
      confirmPassword: "BerbedaSekali123!",
    });

    expect(res.status).toBe(400);
    expect(
      res.body.error.details.some((d: { field: string }) => d.field === "confirmPassword"),
    ).toBe(true);
  });

  it("menolak kata sandi baru sama dengan yang lama", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile/password", csrf, {
      currentPassword: SANDI,
      newPassword: SANDI,
      confirmPassword: SANDI,
    });

    expect(res.status).toBe(400);
  });

  it("menolak kata sandi baru terlalu pendek", async () => {
    const res = await kirim(agent, "patch", "/api/v1/me/profile/password", csrf, {
      currentPassword: SANDI,
      newPassword: "pendek",
      confirmPassword: "pendek",
    });

    expect(res.status).toBe(400);
  });

  it("mengganti kata sandi, menaikkan token_version, dan tetap mempertahankan sesi ini", async () => {
    const sebelum = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { tokenVersion: true, passwordHash: true },
    });

    const res = await kirim(agent, "patch", "/api/v1/me/profile/password", csrf, {
      currentPassword: SANDI,
      newPassword: SANDI_BARU,
      confirmPassword: SANDI_BARU,
    }).expect(200);

    expect(bacaCookie(res, "playora_token")).toBeTruthy();

    const sesudah = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { tokenVersion: true, passwordHash: true },
    });

    expect(sesudah.tokenVersion).toBe(sebelum.tokenVersion + 1);
    expect(sesudah.passwordHash).not.toBe(sebelum.passwordHash);
    expect(await bcrypt.compare(SANDI_BARU, sesudah.passwordHash)).toBe(true);
    expect(await bcrypt.compare(SANDI, sesudah.passwordHash)).toBe(false);

    await agent.get("/api/v1/me/profile").expect(200);
  });

  it("menolak token lama setelah kata sandi diganti", async () => {
    const tokenLama = bacaCookie(
      await agent.post("/api/v1/auth/login").set("Origin", "http://localhost:5173").send({
        email,
        password: SANDI_BARU,
      }),
      "playora_token",
    );

    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    const res = await klien()
      .get("/api/v1/me/profile")
      .set("Cookie", `playora_token=${tokenLama}`);

    expect(res.status).toBe(401);
  });

  it("login dengan kata sandi baru berhasil, kata sandi lama gagal", async () => {
    const baru = klien();
    const csrfBaru = await ambilCsrf(baru);

    await kirim(baru, "post", "/api/v1/auth/login", csrfBaru, {
      email,
      password: SANDI_BARU,
    }).expect(200);

    const lama = klien();
    const csrfLama = await ambilCsrf(lama);
    const res = await kirim(lama, "post", "/api/v1/auth/login", csrfLama, {
      email,
      password: SANDI,
    });

    expect(res.status).toBe(401);
  });
});

void buatGame;
