import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatArtikel, buatGame, buatPengguna, buatPlatform, buatTurnamen } from "../helpers/fixtures";
import { klien } from "../helpers/api";

const agent = klien();

let idPc = "";
let idMobile = "";
let idPengguna = "";

beforeAll(async () => {
  await bersihkanData();

  const pc = await buatPlatform("PC");
  const mobile = await buatPlatform("Mobile");
  idPc = pc.id;
  idMobile = mobile.id;

  const admin = await buatPengguna({
    email: "redaksi@playora.test",
    username: "redaksi",
    role: "ADMIN",
  });
  idPengguna = admin.id;

  await buatGame({
    title: "Valorant",
    genre: "FPS",
    isPopular: true,
    platformIds: [idPc],
    description: "Penembak taktis 5 lawan 5.",
  });
  await buatGame({
    title: "Mobile Legends",
    genre: "MOBA",
    platformIds: [idMobile],
  });
  await buatGame({
    title: "Genshin Impact",
    genre: "Action RPG",
    platformIds: [idPc, idMobile],
  });
  await buatGame({
    title: "Game Rahasia",
    genre: "FPS",
    status: "DRAFT",
    platformIds: [idPc],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/games", () => {
  it("hanya menampilkan game berstatus PUBLISHED", async () => {
    const res = await agent.get("/api/v1/games").expect(200);

    const judul = res.body.data.items.map((g: { title: string }) => g.title);
    expect(judul).toContain("Valorant");
    expect(judul).toContain("Mobile Legends");
    expect(judul).not.toContain("Game Rahasia");
    expect(res.body.meta.total).toBe(3);
  });

  it("menyertakan platform pada setiap kartu game", async () => {
    const res = await agent.get("/api/v1/games?q=Genshin").expect(200);

    const game = res.body.data.items[0];
    expect(game.platforms).toHaveLength(2);
    expect(game.platforms[0].platform.name).toBeTruthy();
  });

  it("mengurutkan game populer lebih dulu", async () => {
    const res = await agent.get("/api/v1/games").expect(200);
    expect(res.body.data.items[0].title).toBe("Valorant");
  });

  it("mencari berdasarkan judul tanpa membedakan huruf besar-kecil", async () => {
    const res = await agent.get("/api/v1/games?q=valorant").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Valorant");
  });

  it("mencari dengan potongan kata", async () => {
    const res = await agent.get("/api/v1/games?q=legend").expect(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it("mengembalikan daftar kosong bila pencarian tidak cocok", async () => {
    const res = await agent.get("/api/v1/games?q=tidakadayangcocok").expect(200);

    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it("memfilter berdasarkan platform", async () => {
    const res = await agent.get("/api/v1/games?platform=Mobile").expect(200);

    const judul = res.body.data.items.map((g: { title: string }) => g.title).sort();
    expect(judul).toEqual(["Genshin Impact", "Mobile Legends"]);
  });

  it("memfilter berdasarkan genre", async () => {
    const res = await agent.get("/api/v1/games?genre=FPS").expect(200);

    const judul = res.body.data.items.map((g: { title: string }) => g.title);
    expect(judul).toEqual(["Valorant"]);
  });

  it("menggabungkan pencarian, platform, dan genre", async () => {
    const res = await agent
      .get("/api/v1/games?q=genshin&platform=PC&genre=Action%20RPG")
      .expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Genshin Impact");
  });

  it("membagi hasil dengan pagination dan mengisi meta", async () => {
    const halaman1 = await agent.get("/api/v1/games?limit=2&page=1").expect(200);
    const halaman2 = await agent.get("/api/v1/games?limit=2&page=2").expect(200);

    expect(halaman1.body.data.items).toHaveLength(2);
    expect(halaman1.body.meta).toEqual({ page: 1, limit: 2, total: 3 });
    expect(halaman2.body.data.items).toHaveLength(1);
    expect(halaman2.body.meta.page).toBe(2);
  });

  it("mengembalikan daftar kosong untuk halaman di luar jangkauan", async () => {
    const res = await agent.get("/api/v1/games?limit=2&page=99").expect(200);

    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.meta.total).toBe(3);
  });

  it("menolak limit di luar rentang dengan 400", async () => {
    const res = await agent.get("/api/v1/games?limit=100").expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].field).toBe("limit");
  });

  it("menolak halaman tidak valid dengan 400", async () => {
    const res = await agent.get("/api/v1/games?page=abc").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/games/:slug", () => {
  it("mengembalikan detail beserta platform, artikel, dan turnamen terkait", async () => {
    const daftar = await agent.get("/api/v1/games?q=Genshin").expect(200);
    const slug = daftar.body.data.items[0].slug;
    const idGame = daftar.body.data.items[0].id;

    await buatArtikel({
      title: "Panduan Genshin",
      gameId: idGame,
      authorId: idPengguna,
      category: "TUTORIAL",
    });
    await buatTurnamen({
      title: "Turnamen Genshin Lokal",
      gameId: idGame,
      managerId: idPengguna,
    });

    const res = await agent.get(`/api/v1/games/${slug}`).expect(200);
    const game = res.body.data.game;

    expect(game.title).toBe("Genshin Impact");
    expect(game.description).toContain("Genshin Impact");
    expect(game.platforms).toHaveLength(2);
    expect(game.articles).toHaveLength(1);
    expect(game.articles[0].title).toBe("Panduan Genshin");
    expect(game.tournaments).toHaveLength(1);
    expect(game.tournaments[0].title).toBe("Turnamen Genshin Lokal");
  });

  it("mengembalikan 404 untuk game berstatus DRAFT", async () => {
    const draft = await prisma.game.findFirst({ where: { status: "DRAFT" }, select: { slug: true } });

    const res = await agent.get(`/api/v1/games/${draft!.slug}`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk slug yang tidak ada", async () => {
    const res = await agent.get("/api/v1/games/game-yang-tidak-ada").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("tidak menampilkan artikel DRAFT pada detail game", async () => {
    const daftar = await agent.get("/api/v1/games?q=Valorant").expect(200);
    const { slug, id } = daftar.body.data.items[0];

    await prisma.article.create({
      data: {
        title: "Artikel Belum Terbit",
        slug: "artikel-belum-terbit",
        content: "Draf.",
        category: "NEWS",
        status: "DRAFT",
        authorId: idPengguna,
        gameId: id,
      },
    });

    const res = await agent.get(`/api/v1/games/${slug}`).expect(200);
    const judul = res.body.data.game.articles.map((a: { title: string }) => a.title);
    expect(judul).not.toContain("Artikel Belum Terbit");
  });

  it("tidak menampilkan turnamen yang belum dipublikasikan", async () => {
    const daftar = await agent.get("/api/v1/games?q=Mobile Legends").expect(200);
    const { slug, id } = daftar.body.data.items[0];

    await buatTurnamen({
      title: "Turnamen Draf",
      gameId: id,
      managerId: idPengguna,
      isPublished: false,
    });

    const res = await agent.get(`/api/v1/games/${slug}`).expect(200);
    const judul = res.body.data.game.tournaments.map((t: { title: string }) => t.title);
    expect(judul).not.toContain("Turnamen Draf");
  });
});

describe("GET /api/v1/games/meta/filters", () => {
  it("mengembalikan daftar platform dan genre dari game publik", async () => {
    const res = await agent.get("/api/v1/games/meta/filters").expect(200);

    const namaPlatform = res.body.data.platforms.map((p: { name: string }) => p.name);
    expect(namaPlatform).toEqual(expect.arrayContaining(["PC", "Mobile"]));

    expect(res.body.data.genres).toEqual(
      expect.arrayContaining(["FPS", "MOBA", "Action RPG"]),
    );
  });

  it("tidak membocorkan genre yang hanya dimiliki game DRAFT", async () => {
    await buatGame({ title: "Game Genre Unik", genre: "GenreRahasia", status: "DRAFT" });

    const res = await agent.get("/api/v1/games/meta/filters").expect(200);
    expect(res.body.data.genres).not.toContain("GenreRahasia");
  });

  it("tidak tertangkap sebagai parameter slug", async () => {
    const res = await agent.get("/api/v1/games/meta/filters").expect(200);
    expect(res.body.success).toBe(true);
  });
});
