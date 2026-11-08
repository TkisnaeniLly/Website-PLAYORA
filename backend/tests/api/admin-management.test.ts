import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame } from "../helpers/fixtures";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "AdminUjiSandi123!";
type Agent = ReturnType<typeof klien>;

let admin: Agent, csrfAdmin = "";
let pengguna: Agent, csrfPengguna = "";
let idPengguna = "";
let idAdmin = "";
let idGame = "";

async function daftar(email: string, username: string, name: string, role: "USER" | "ADMIN" = "USER") {
  const agent = klien();
  const csrf = await ambilCsrf(agent);
  await kirim(agent, "post", "/api/v1/auth/register", csrf, {
    name,
    username,
    email,
    password: SANDI,
  }).expect(201);
  if (role === "ADMIN") {
    const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  }
  return agent;
}

beforeAll(async () => {
  await bersihkanData();

  const stempel = Date.now();
  admin = await daftar(`adm.${stempel}@playora.test`, `adm_${stempel}`, "Admin Uji", "ADMIN");
  csrfAdmin = await ambilCsrf(admin);
  pengguna = await daftar(`usr.${stempel}@playora.test`, `usr_${stempel}`, "Pengguna Uji");
  csrfPengguna = await ambilCsrf(pengguna);

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: `usr.${stempel}@playora.test` },
    select: { id: true },
  });
  idPengguna = user.id;

  const akunAdmin = await prisma.user.findUniqueOrThrow({
    where: { email: `adm.${stempel}@playora.test` },
    select: { id: true },
  });
  idAdmin = akunAdmin.id;

  const game = await buatGame({ title: "Game Admin Uji", genre: "MOBA" });
  idGame = game.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.article.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.gamePlatform.deleteMany({});
});

describe("Manajemen konten oleh admin", () => {
  it("menolak user biasa mengakses daftar game admin (403)", async () => {
    const res = await pengguna.get("/api/v1/admin/games");
    expect(res.status).toBe(403);
  });

  it("menolak tamu mengakses dashboard admin (401)", async () => {
    const res = await klien().get("/api/v1/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("admin melihat seluruh game termasuk DRAFT", async () => {
    await buatGame({ title: "Game Draft", genre: "RPG", status: "DRAFT" });

    const res = await admin.get("/api/v1/admin/games");
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items.some((g: { status: string }) => g.status === "DRAFT")).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it("admin membuat game baru", async () => {
    const res = await kirim(admin, "post", "/api/v1/admin/games", csrfAdmin, {
      title: "Game Baru Admin",
      slug: "game-baru-admin",
      description: "Deskripsi game yang dibuat oleh admin.",
      genre: "Strategy",
      status: "DRAFT",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.game.slug).toBe("game-baru-admin");
    expect(res.body.data.game.status).toBe("DRAFT");

    const tersimpan = await prisma.game.findUnique({
      where: { slug: "game-baru-admin" },
      select: { title: true, status: true },
    });
    expect(tersimpan?.title).toBe("Game Baru Admin");
  });

  it("menolak slug duplikat (409)", async () => {
    const res = await kirim(admin, "post", "/api/v1/admin/games", csrfAdmin, {
      title: "Game Kembar",
      slug: "game-kembar",
      description: "Deskripsi game yang dibuat oleh admin.",
      genre: "Strategy",
    });
    expect(res.status).toBe(201);

    const kedua = await kirim(admin, "post", "/api/v1/admin/games", csrfAdmin, {
      title: "Game Kembar Dua",
      slug: "game-kembar",
      description: "Deskripsi game yang dibuat oleh admin.",
      genre: "Strategy",
    });
    expect(kedua.status).toBe(409);
    expect(kedua.body.error.code).toBe("CONFLICT");
  });

  it("menolak game dengan data tidak valid (400)", async () => {
    const res = await kirim(admin, "post", "/api/v1/admin/games", csrfAdmin, {
      title: "X",
      slug: "BUKAN SLURG",
      description: "pendek",
      genre: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("admin mengubah status game menjadi PUBLISHED", async () => {
    const game = await buatGame({ title: "Game Untuk Diterbitkan", genre: "RPG", status: "DRAFT" });

    const res = await kirim(admin, "patch", `/api/v1/admin/games/${game.id}`, csrfAdmin, {
      status: "PUBLISHED",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.game.status).toBe("PUBLISHED");

    const publik = await prisma.game.findUnique({ where: { id: game.id }, select: { status: true } });
    expect(publik?.status).toBe("PUBLISHED");
  });

  it("admin menghapus game yang tidak dirujuk (200)", async () => {
    const game = await buatGame({ title: "Game Untuk Dihapus", genre: "RPG" });

    const res = await kirim(admin, "delete", `/api/v1/admin/games/${game.id}`, csrfAdmin, {});
    expect(res.status).toBe(200);

    const tersisa = await prisma.game.findUnique({ where: { id: game.id }, select: { id: true } });
    expect(tersisa).toBeNull();
  });

  it("admin membuat artikel dan menetapkannya sebagai published", async () => {
    const res = await kirim(admin, "post", "/api/v1/admin/articles", csrfAdmin, {
      title: "Artikel Baru Admin",
      slug: "artikel-baru-admin",
      content: "Isi artikel yang dibuat oleh administrator untuk pengujian.",
      category: "NEWS",
      status: "PUBLISHED",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.article.status).toBe("PUBLISHED");
    expect(res.body.data.article.publishedAt).toBeTruthy();

    const artikel = await prisma.article.findUnique({
      where: { slug: "artikel-baru-admin" },
      select: { status: true, publishedAt: true, authorId: true },
    });
    expect(artikel?.status).toBe("PUBLISHED");
    expect(artikel?.publishedAt).not.toBeNull();
  });

  it("admin melihat artikel DRAFT di daftar admin", async () => {
    await kirim(admin, "post", "/api/v1/admin/articles", csrfAdmin, {
      title: "Artikel Draft Admin",
      slug: "artikel-draft-admin",
      content: "Isi artikel draft yang dibuat oleh administrator.",
      category: "TIPS",
      status: "DRAFT",
    });

    const res = await admin.get("/api/v1/admin/articles");
    expect(res.status).toBe(200);
    expect(res.body.data.items.some((a: { status: string }) => a.status === "DRAFT")).toBe(true);
  });

  it("admin mengubah artikel menjadi DRAFT", async () => {
    const dibuat = await kirim(admin, "post", "/api/v1/admin/articles", csrfAdmin, {
      title: "Artikel Untuk Diedit",
      slug: "artikel-untuk-diedit",
      content: "Isi artikel yang akan diubah statusnya oleh administrator.",
      category: "UPDATE",
      status: "PUBLISHED",
    });

    const id = dibuat.body.data.article.id;
    const res = await kirim(admin, "patch", `/api/v1/admin/articles/${id}`, csrfAdmin, {
      status: "DRAFT",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.article.status).toBe("DRAFT");
  });

  it("menolak artikel yang tersimpan pengguna untuk dihapus (409)", async () => {
    const dibuat = await kirim(admin, "post", "/api/v1/admin/articles", csrfAdmin, {
      title: "Artikel Tersimpan",
      slug: "artikel-tersimpan",
      content: "Isi artikel yang disimpan oleh pengguna sehingga tidak bisa dihapus.",
      category: "NEWS",
      status: "PUBLISHED",
    });

    await prisma.bookmark.create({
      data: { userId: idPengguna, articleId: dibuat.body.data.article.id },
    });

    const res = await kirim(
      admin,
      "delete",
      `/api/v1/admin/articles/${dibuat.body.data.article.id}`,
      csrfAdmin,
      {},
    );
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});

describe("Manajemen pengguna oleh admin", () => {
  it("admin melihat daftar pengguna dengan jumlah pengajuan", async () => {
    const res = await admin.get("/api/v1/admin/users");
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.items[0]).toHaveProperty("_count");
  });

  it("admin mencari pengguna berdasarkan nama", async () => {
    const res = await admin.get("/api/v1/admin/users?q=Pengguna Uji");
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });

  it("admin menaikkan peran pengguna menjadi ADMIN", async () => {
    const res = await kirim(admin, "patch", `/api/v1/admin/users/${idPengguna}`, csrfAdmin, {
      role: "ADMIN",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("ADMIN");

    const terbaru = await prisma.user.findUnique({
      where: { id: idPengguna },
      select: { role: true },
    });
    expect(terbaru?.role).toBe("ADMIN");
  });

  it("admin menurunkan peran kembali menjadi USER", async () => {
    const res = await kirim(admin, "patch", `/api/v1/admin/users/${idPengguna}`, csrfAdmin, {
      role: "USER",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("USER");
  });

  it("admin menonaktifkan akun pengguna", async () => {
    const res = await kirim(admin, "patch", `/api/v1/admin/users/${idPengguna}`, csrfAdmin, {
      isActive: false,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.isActive).toBe(false);

    const terbaru = await prisma.user.findUnique({
      where: { id: idPengguna },
      select: { isActive: true, tokenVersion: true },
    });
    expect(terbaru?.isActive).toBe(false);
    expect(terbaru?.tokenVersion).toBeGreaterThan(0);
  });

  it("akun yang dinonaktifkan tidak bisa masuk lagi", async () => {
    const res = await kirim(pengguna, "post", "/api/v1/auth/login", csrfPengguna, {
      email: (await prisma.user.findUniqueOrThrow({ where: { id: idPengguna }, select: { email: true } })).email,
      password: SANDI,
    });
    expect(res.status).toBe(401);
  });

  it("admin tidak dapat menonaktifkan akunnya sendiri (409)", async () => {
    const res = await kirim(admin, "patch", `/api/v1/admin/users/${idAdmin}`, csrfAdmin, {
      isActive: false,
    });
    expect(res.status).toBe(409);
  });

  it("admin tidak dapat menurunkan perannya sendiri (409)", async () => {
    const res = await kirim(admin, "patch", `/api/v1/admin/users/${idAdmin}`, csrfAdmin, {
      role: "USER",
    });
    expect(res.status).toBe(409);
  });

  it("user biasa tidak bisa mengubah peran pengguna lain (403)", async () => {
    const stempel = Date.now();
    const biasa = await daftar(`biasa.${stempel}@playora.test`, `biasa_${stempel}`, "Pengguna Biasa");
    const csrfBiasa = await ambilCsrf(biasa);

    const res = await kirim(biasa, "patch", `/api/v1/admin/users/${idPengguna}`, csrfBiasa, {
      role: "ADMIN",
    });
    expect(res.status).toBe(403);
  });
});

describe("Dashboard admin", () => {
  it("mengembalikan ringkasan data sistem", async () => {
    const res = await admin.get("/api/v1/admin/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.data.users.total).toBeGreaterThanOrEqual(2);
    expect(res.body.data.users.active).toBeGreaterThanOrEqual(1);
    expect(res.body.data.games).toHaveProperty("total");
    expect(res.body.data.articles).toHaveProperty("published");
    expect(res.body.data.tournaments).toHaveProperty("total");
    expect(res.body.data.submissions).toHaveProperty("pending");
    expect(res.body.data).toHaveProperty("pendingReviewResults");
    expect(Array.isArray(res.body.data.recentSubmissions)).toBe(true);
  });

  it("user biasa tidak bisa membuka dashboard (403)", async () => {
    const stempel = Date.now();
    const biasa = await daftar(`biasa.${stempel}@playora.test`, `biasa2_${stempel}`, "Pengguna Biasa Dua");
    const csrfBiasa = await ambilCsrf(biasa);

    const res = await biasa.get("/api/v1/admin/dashboard");
    expect(res.status).toBe(403);
  });
});
