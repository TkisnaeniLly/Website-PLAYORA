import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "DiscordRoom123!";
type Agent = ReturnType<typeof klien>;

let pemilik: Agent, csrfPemilik = "";
let orangLain: Agent, csrfOrangLain = "";
let admin: Agent, csrfAdmin = "";
let idPemilik = "";
let idGame = "";

const URL_INVITE = "https://discord.gg/playora-uji";

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

async function loginUlang(agent: Agent, email: string) {
  const csrf = await ambilCsrf(agent);
  await kirim(agent, "post", "/api/v1/auth/login", csrf, { email, password: SANDI }).expect(200);
  return ambilCsrf(agent);
}

function dataRoom(nama = "Discord Gamer Indonesia") {
  return {
    name: nama,
    inviteUrl: URL_INVITE,
    description: "Ruang Discord untuk mabar, diskusi turnamen, dan cari teman bermain.",
    gameId: idGame,
    memberCount: 1250,
  };
}

beforeAll(async () => {
  await bersihkanData();
  const stempel = Date.now();

  pemilik = await daftar(`dr.pemilik.${stempel}@playora.test`, `dr_pemilik_${stempel}`, "Pemilik Ruang");
  csrfPemilik = await ambilCsrf(pemilik);
  idPemilik = (
    await prisma.user.findUniqueOrThrow({ where: { email: `dr.pemilik.${stempel}@playora.test` } })
  ).id;

  orangLain = await daftar(`dr.lain.${stempel}@playora.test`, `dr_lain_${stempel}`, "Pengguna Lain");
  csrfOrangLain = await ambilCsrf(orangLain);

  const emailAdmin = `dr.admin.${stempel}@playora.test`;
  admin = await daftar(emailAdmin, `dr_admin_${stempel}`, "Admin Ruang");
  await prisma.user.update({ where: { email: emailAdmin }, data: { role: "ADMIN" } });
  csrfAdmin = await loginUlang(admin, emailAdmin);

  const game = await prisma.game.create({
    data: {
      title: "Game Ruang Discord",
      slug: `game-ruang-discord-${stempel}`,
      description: "Game untuk pengujian ruang Discord.",
      genre: "MOBA",
      status: "PUBLISHED",
    },
    select: { id: true },
  });
  idGame = game.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.discordRoom.deleteMany({});
  await prisma.notification.deleteMany({});
});

function kirimRuangan(agent: Agent, csrf: string, nilai = dataRoom()) {
  return kirim(agent, "post", "/api/v1/community/discord-rooms", csrf, nilai);
}

describe("Ruang Discord - pengajuan pengguna", () => {
  it("tamu tidak dapat melihat rekomendasi ruang Discord", async () => {
    const res = await klien().get("/api/v1/community/discord-rooms");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("pengguna masuk hanya melihat ruang disetujui tanpa data internal", async () => {
    await prisma.discordRoom.create({
      data: {
        submittedBy: idPemilik,
        name: "Ruang Publik",
        inviteUrl: "https://discord.gg/publik-uji",
        description: "Ruang yang sudah disetujui admin dan tampil untuk anggota.",
        status: "APPROVED",
      },
    });
    await prisma.discordRoom.create({
      data: {
        submittedBy: idPemilik,
        name: "Ruang Menunggu",
        inviteUrl: "https://discord.gg/menunggu-uji",
        description: "Ruang yang masih menunggu tinjauan admin.",
        status: "PENDING",
      },
    });

    const res = await orangLain.get("/api/v1/community/discord-rooms").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].name).toBe("Ruang Publik");
    expect(res.body.data.items[0]).not.toHaveProperty("submittedBy");
    expect(res.body.data.items[0]).not.toHaveProperty("adminNote");
  });

  it("tamu tidak dapat mengajukan ruang", async () => {
    const tamu = klien();
    const csrf = await ambilCsrf(tamu);
    const res = await kirim(tamu, "post", "/api/v1/community/discord-rooms", csrf, dataRoom());
    expect(res.status).toBe(401);
  });

  it("pengguna dapat mengajukan ruang dan status awalnya PENDING", async () => {
    const res = await kirimRuangan(pemilik, csrfPemilik).expect(201);

    expect(res.body.data.room.status).toBe("PENDING");
    expect(res.body.data.room.name).toBe("Discord Gamer Indonesia");
    expect(res.body.data.room.game.id).toBe(idGame);

    const publik = await pemilik.get("/api/v1/community/discord-rooms").expect(200);
    expect(publik.body.data.items).toHaveLength(0);
  });

  it("pengguna dapat melihat pengajuan miliknya beserta statusnya", async () => {
    await kirimRuangan(pemilik, csrfPemilik).expect(201);

    const res = await pemilik.get("/api/v1/community/discord-rooms/mine").expect(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].status).toBe("PENDING");
    expect(res.body.data.items[0].adminNote).toBeNull();
  });

  it("menolak tautan undangan yang bukan Discord", async () => {
    const res = await kirimRuangan(pemilik, csrfPemilik, {
      ...dataRoom(),
      inviteUrl: "https://contoh.com/undang",
    }).expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].field).toBe("inviteUrl");
  });

  it("menolak nama dan deskripsi yang terlalu pendek", async () => {
    const res = await kirimRuangan(pemilik, csrfPemilik, {
      ...dataRoom(),
      name: "ab",
      description: "pendek",
    }).expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("menolak tautan undangan yang sudah terdaftar", async () => {
    await kirimRuangan(pemilik, csrfPemilik).expect(201);

    const res = await kirimRuangan(orangLain, csrfOrangLain).expect(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("hanya pemilik yang dapat mengubah pengajuannya", async () => {
    const dibuat = await kirimRuangan(pemilik, csrfPemilik).expect(201);
    const id = dibuat.body.data.room.id;

    await kirim(orangLain, "patch", `/api/v1/community/discord-rooms/${id}`, csrfOrangLain, {
      name: "Ruang Bajakan",
    }).expect(404);

    const res = await kirim(pemilik, "patch", `/api/v1/community/discord-rooms/${id}`, csrfPemilik, {
      name: "Ruang Diperbarui",
    }).expect(200);

    expect(res.body.data.room.name).toBe("Ruang Diperbarui");
    expect(res.body.data.room.status).toBe("PENDING");
  });
});

describe("Ruang Discord - validasi admin", () => {
  async function ajukan() {
    const res = await kirimRuangan(pemilik, csrfPemilik).expect(201);
    return res.body.data.room.id as string;
  }

  it("hanya admin yang dapat melihat antrean validasi", async () => {
    await kirim(pemilik, "get", "/api/v1/admin/discord-rooms", csrfPemilik).expect(403);

    const res = await admin.get("/api/v1/admin/discord-rooms").expect(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it("admin menyetujui ruang sehingga tampil publik dan pengaju mendapat notifikasi", async () => {
    const id = await ajukan();

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/discord-rooms/${id}/review`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    expect(res.body.data.status).toBe("APPROVED");

    const publik = await pemilik.get("/api/v1/community/discord-rooms").expect(200);
    expect(publik.body.data.items).toHaveLength(1);
    expect(publik.body.data.items[0].id).toBe(id);

    const notifikasi = await prisma.notification.findMany({
      where: { userId: idPemilik },
      select: { type: true },
    });
    expect(notifikasi).toHaveLength(1);
    expect(notifikasi[0]!.type).toBe("DISCORD_ROOM_APPROVED");
  });

  it("admin wajib memberi catatan saat menolak ruang", async () => {
    const id = await ajukan();

    const tanpaCatatan = await kirim(
      admin,
      "patch",
      `/api/v1/admin/discord-rooms/${id}/review`,
      csrfAdmin,
      { decision: "REJECTED" },
    ).expect(400);
    expect(tanpaCatatan.body.error.code).toBe("VALIDATION_ERROR");

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/discord-rooms/${id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Tautan undangan tidak valid." },
    ).expect(200);

    expect(res.body.data.status).toBe("REJECTED");

    const publik = await pemilik.get("/api/v1/community/discord-rooms").expect(200);
    expect(publik.body.data.items).toHaveLength(0);

    const milik = await pemilik.get("/api/v1/community/discord-rooms/mine").expect(200);
    expect(milik.body.data.items[0].status).toBe("REJECTED");
    expect(milik.body.data.items[0].adminNote).toBe("Tautan undangan tidak valid.");
  });

  it("ruang yang sudah diputuskan tidak dapat ditinjau ulang", async () => {
    const id = await ajukan();

    await kirim(admin, "patch", `/api/v1/admin/discord-rooms/${id}/review`, csrfAdmin, {
      decision: "APPROVED",
    }).expect(200);

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/discord-rooms/${id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Ditolak setelah disetujui." },
    ).expect(409);

    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("pengajuan yang sedang ditinjau tidak tampil di rekomendasi publik", async () => {
    await ajukan();

    const publik = await pemilik.get("/api/v1/community/discord-rooms").expect(200);
    expect(publik.body.data.items).toHaveLength(0);

    const daftarAdmin = await admin
      .get("/api/v1/admin/discord-rooms?status=PENDING")
      .expect(200);
    expect(daftarAdmin.body.data.items).toHaveLength(1);
  });
});
