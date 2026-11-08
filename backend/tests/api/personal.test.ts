import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame } from "../helpers/fixtures";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "FavoritSandi123!";
type Agent = ReturnType<typeof klien>;

let pengguna: Agent, csrfPengguna = "";
let orangLain: Agent, csrfOrangLain = "";
let admin: Agent, csrfAdmin = "";

let idGame = "";
let idGameLain = "";
let idAuthor = "";

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

async function buatArtikel(judul: string, slug: string) {
  return prisma.article.create({
    data: {
      title: judul,
      slug,
      content: "Konten artikel untuk pengujian.",
      category: "NEWS",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: idAuthor,
    },
    select: { id: true },
  });
}

beforeAll(async () => {
  await bersihkanData();

  const stempel = Date.now();
  pengguna = await daftar(`fav.${stempel}@playora.test`, `fav_${stempel}`, "Pengguna Favorit");
  csrfPengguna = await ambilCsrf(pengguna);
  orangLain = await daftar(`fav.lain.${stempel}@playora.test`, `fav_lain_${stempel}`, "Pengguna Lain");
  csrfOrangLain = await ambilCsrf(orangLain);

  idAuthor = (
    await prisma.user.findUniqueOrThrow({ where: { email: `fav.${stempel}@playora.test` } })
  ).id;

  const game = await buatGame({ title: "Game Favorit Uji", genre: "MOBA" });
  idGame = game.id;
  const gameLain = await buatGame({ title: "Game Favorit Uji Dua", genre: "FPS" });
  idGameLain = gameLain.id;

  admin = klien();
  csrfAdmin = await ambilCsrf(admin);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.userGame.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.article.deleteMany({ where: { slug: { startsWith: "artikel-favorit" } } });
});

describe("Favorit game (MVP #17)", () => {
  it("menolak tamu tanpa sesi", async () => {
    const res = await klien().get("/api/v1/me/favorites");
    expect(res.status).toBe(401);
  });

  it("menyimpan game sebagai favorit", async () => {
    const res = await kirim(
      pengguna,
      "post",
      `/api/v1/me/favorites/${idGame}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(201);

    const tersimpan = await prisma.userGame.findMany({ select: { gameId: true } });
    expect(tersimpan).toHaveLength(1);
    expect(tersimpan[0]?.gameId).toBe(idGame);
  });

  it("menyimpan ulang game yang sama tidak menduplikasi (200)", async () => {
    await kirim(pengguna, "post", `/api/v1/me/favorites/${idGame}`, csrfPengguna, {}).expect(201);
    const res = await kirim(
      pengguna,
      "post",
      `/api/v1/me/favorites/${idGame}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(200);

    const tersimpan = await prisma.userGame.count();
    expect(tersimpan).toBe(1);
  });

  it("menolak game yang tidak ada (404)", async () => {
    const res = await kirim(
      pengguna,
      "post",
      "/api/v1/me/favorites/ffffffff-ffff-4fff-8fff-ffffffffffff",
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("daftar favorit hanya berisi milik sendiri", async () => {
    await kirim(pengguna, "post", `/api/v1/me/favorites/${idGame}`, csrfPengguna, {}).expect(201);
    await kirim(orangLain, "post", `/api/v1/me/favorites/${idGameLain}`, csrfOrangLain, {}).expect(
      201,
    );

    const res = await pengguna.get("/api/v1/me/favorites");
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].game.id).toBe(idGame);
    expect(res.body.data.total).toBe(1);
  });

  it("daftar favorit mengembalikan data game untuk kartu", async () => {
    await kirim(pengguna, "post", `/api/v1/me/favorites/${idGame}`, csrfPengguna, {}).expect(201);

    const res = await pengguna.get("/api/v1/me/favorites");
    const game = res.body.data.items[0].game;

    expect(game.title).toBe("Game Favorit Uji");
    expect(game.slug).toBeTruthy();
    expect(game).toHaveProperty("genre");
    expect(Array.isArray(game.platforms)).toBe(true);
  });

  it("menghapus game dari favorit", async () => {
    await kirim(pengguna, "post", `/api/v1/me/favorites/${idGame}`, csrfPengguna, {}).expect(201);

    const res = await kirim(
      pengguna,
      "delete",
      `/api/v1/me/favorites/${idGame}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(200);
    expect(res.body.data.dihapus).toBe(1);

    const tersisa = await prisma.userGame.count();
    expect(tersisa).toBe(0);
  });

  it("menghapus favorit yang tidak ada tetap aman (200)", async () => {
    const res = await kirim(
      pengguna,
      "delete",
      `/api/v1/me/favorites/${idGame}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(200);
    expect(res.body.data.dihapus).toBe(0);
  });

  it("satu pengguna tidak bisa menghapus milik pengguna lain", async () => {
    await kirim(pengguna, "post", `/api/v1/me/favorites/${idGame}`, csrfPengguna, {}).expect(201);

    await kirim(orangLain, "delete", `/api/v1/me/favorites/${idGame}`, csrfOrangLain, {}).expect(
      200,
    );

    const tersisa = await prisma.userGame.count();
    expect(tersisa).toBe(1);
  });
});

describe("Simpanan artikel (MVP #18)", () => {
  it("menolak tamu tanpa sesi", async () => {
    const res = await klien().get("/api/v1/me/bookmarks");
    expect(res.status).toBe(401);
  });

  it("menyimpan artikel sebagai simpanan", async () => {
    const artikel = await buatArtikel("Artikel Favorit Uji", "artikel-favorit-1");

    const res = await kirim(
      pengguna,
      "post",
      `/api/v1/me/bookmarks/${artikel.id}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(201);

    const tersimpan = await prisma.bookmark.findMany({ select: { articleId: true } });
    expect(tersimpan).toHaveLength(1);
  });

  it("menyimpan ulang artikel yang sama tidak menduplikasi (200)", async () => {
    const artikel = await buatArtikel("Artikel Favorit Uji Dua", "artikel-favorit-2");
    await kirim(pengguna, "post", `/api/v1/me/bookmarks/${artikel.id}`, csrfPengguna, {}).expect(
      201,
    );

    const res = await kirim(
      pengguna,
      "post",
      `/api/v1/me/bookmarks/${artikel.id}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(200);
    expect(await prisma.bookmark.count()).toBe(1);
  });

  it("menolak artikel yang tidak ada (404)", async () => {
    const res = await kirim(
      pengguna,
      "post",
      "/api/v1/me/bookmarks/ffffffff-ffff-4fff-8fff-ffffffffffff",
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(404);
  });

  it("daftar simpanan hanya berisi milik sendiri", async () => {
    const artikel = await buatArtikel("Artikel Favorit Uji Tiga", "artikel-favorit-3");
    await kirim(pengguna, "post", `/api/v1/me/bookmarks/${artikel.id}`, csrfPengguna, {}).expect(
      201,
    );

    const res = await pengguna.get("/api/v1/me/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].article.title).toBe("Artikel Favorit Uji Tiga");
  });

  it("menghapus artikel dari simpanan", async () => {
    const artikel = await buatArtikel("Artikel Favorit Uji Empat", "artikel-favorit-4");
    await kirim(pengguna, "post", `/api/v1/me/bookmarks/${artikel.id}`, csrfPengguna, {}).expect(
      201,
    );

    const res = await kirim(
      pengguna,
      "delete",
      `/api/v1/me/bookmarks/${artikel.id}`,
      csrfPengguna,
      {},
    );
    expect(res.status).toBe(200);
    expect(res.body.data.dihapus).toBe(1);
    expect(await prisma.bookmark.count()).toBe(0);
  });
});
