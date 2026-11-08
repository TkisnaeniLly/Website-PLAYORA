import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { bersihkanData, prisma } from "../helpers/db";
import { buatPengguna } from "../helpers/fixtures";
import { ambilCsrf, bacaCookie, klien, kirim } from "../helpers/api";

const SANDI = "RahasiaUji123!";
let agent: ReturnType<typeof klien>;
let csrf = "";
let email = "";

beforeAll(async () => {
  await bersihkanData();

  email = `tokenversi.${Date.now()}@playora.test`;
  await buatPengguna({
    email,
    username: `tokenversi_${Date.now()}`,
    passwordHash: await bcrypt.hash(SANDI, 8),
  });

  agent = klien();
  csrf = await ambilCsrf(agent);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Pencabutan sesi melalui token_version", () => {
  it("login menghasilkan sesi yang dapat dipakai", async () => {
    const res = await kirim(agent, "post", "/api/v1/auth/login", csrf, {
      email,
      password: SANDI,
    }).expect(200);

    expect(bacaCookie(res, "playora_token")).toBeTruthy();
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user).not.toHaveProperty("tokenVersion");

    const me = await agent.get("/api/v1/auth/me").expect(200);
    expect(me.body.data.user.email).toBe(email);
  });

  it("menolak token lama setelah token_version dinaikkan", async () => {
    const sebelum = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { id: true, tokenVersion: true },
    });

    await prisma.user.update({
      where: { id: sebelum.id },
      data: { tokenVersion: { increment: 1 } },
    });

    const me = await agent.get("/api/v1/auth/me").expect(401);
    expect(me.body.error.code).toBe("UNAUTHORIZED");
  });

  it("login ulang menerbitkan token dengan versi terbaru", async () => {
    csrf = await ambilCsrf(agent);

    await kirim(agent, "post", "/api/v1/auth/login", csrf, {
      email,
      password: SANDI,
    }).expect(200);

    const me = await agent.get("/api/v1/auth/me").expect(200);
    expect(me.body.data.user.email).toBe(email);

    const sesudah = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { tokenVersion: true },
    });
    expect(sesudah.tokenVersion).toBe(1);
  });

  it("logout tetap menghapus cookie sesi", async () => {
    csrf = await ambilCsrf(agent);

    const res = await kirim(agent, "post", "/api/v1/auth/logout", csrf).expect(200);
    expect(res.body.success).toBe(true);

    const me = await agent.get("/api/v1/auth/me").expect(401);
    expect(me.body.error.code).toBe("UNAUTHORIZED");
  });

  it("token yang kedaluwarsa atau rusak ditolak", async () => {
    const res = await agent
      .get("/api/v1/auth/me")
      .set("Cookie", "playora_token=token.tidak.valid")
      .expect(401);

    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
