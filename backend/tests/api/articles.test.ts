import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatArtikel, buatGame, buatPengguna } from "../helpers/fixtures";
import { klien } from "../helpers/api";

const agent = klien();

let idGame = "";
let idPenulis = "";
let slugBerita = "";
let slugPanduan = "";
let slugDraf = "";
let slugTerjadwal = "";

beforeAll(async () => {
  await bersihkanData();

  const penulis = await buatPengguna({
    email: "redaksi.artikel@playora.test",
    username: "redaksi_artikel",
    role: "ADMIN",
  });
  idPenulis = penulis.id;

  const game = await buatGame({ title: "Valorant Artikel", genre: "FPS" });
  idGame = game.id;

  const berita = await buatArtikel({
    title: "Turnamen Nasional Dibuka",
    gameId: idGame,
    authorId: idPenulis,
    category: "NEWS",
    publishedAt: new Date("2026-03-10T00:00:00Z"),
  });
  slugBerita = berita.slug;

  const panduan = await buatArtikel({
    title: "Panduan Aim Latihan",
    gameId: idGame,
    authorId: idPenulis,
    category: "TUTORIAL",
    publishedAt: new Date("2026-03-09T00:00:00Z"),
  });
  slugPanduan = panduan.slug;

  await buatArtikel({
    title: "Pembaruan Musim",
    gameId: idGame,
    authorId: idPenulis,
    category: "UPDATE",
    publishedAt: new Date("2026-03-08T00:00:00Z"),
  });

  await buatArtikel({
    title: "Tips Crosshair",
    gameId: idGame,
    authorId: idPenulis,
    category: "TIPS",
    publishedAt: new Date("2026-03-07T00:00:00Z"),
  });

  await buatArtikel({
    title: "Liputan Esports Daerah",
    gameId: idGame,
    authorId: idPenulis,
    category: "ESPORTS",
    publishedAt: new Date("2026-03-06T00:00:00Z"),
  });

  const draf = await buatArtikel({
    title: "Artikel Belum Terbit",
    gameId: idGame,
    authorId: idPenulis,
    category: "NEWS",
    status: "DRAFT",
    publishedAt: null,
  });
  slugDraf = draf.slug;

  const terjadwal = await buatArtikel({
    title: "Artikel Terjadwal Masa Depan",
    gameId: idGame,
    authorId: idPenulis,
    category: "NEWS",
    publishedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  slugTerjadwal = terjadwal.slug;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/articles", () => {
  it("hanya menampilkan artikel PUBLISHED yang sudah lewat tanggal terbit", async () => {
    const res = await agent.get("/api/v1/articles").expect(200);

    const judul = res.body.data.items.map((a: { title: string }) => a.title);
    expect(judul).toHaveLength(5);
    expect(judul).not.toContain("Artikel Belum Terbit");
    expect(judul).not.toContain("Artikel Terjadwal Masa Depan");
    expect(res.body.meta.total).toBe(5);
  });

  it("mengurutkan dari yang paling baru terbit", async () => {
    const res = await agent.get("/api/v1/articles").expect(200);
    expect(res.body.data.items[0].title).toBe("Turnamen Nasional Dibuka");
  });

  it("menyertakan penulis dan game terkait pada setiap kartu", async () => {
    const res = await agent.get("/api/v1/articles").expect(200);
    const pertama = res.body.data.items[0];

    expect(pertama.author.username).toBe("redaksi_artikel");
    expect(pertama.game.title).toBe("Valorant Artikel");
    expect(pertama.game.slug).toBeTruthy();
  });

  it("memfilter tipe berita (NEWS, UPDATE, ESPORTS)", async () => {
    const res = await agent.get("/api/v1/articles?type=berita").expect(200);

    const kategori = new Set(res.body.data.items.map((a: { category: string }) => a.category));
    expect(kategori).toEqual(new Set(["NEWS", "UPDATE", "ESPORTS"]));
    expect(res.body.meta.total).toBe(3);
  });

  it("memfilter tipe panduan (TIPS, TUTORIAL)", async () => {
    const res = await agent.get("/api/v1/articles?type=panduan").expect(200);

    const kategori = new Set(res.body.data.items.map((a: { category: string }) => a.category));
    expect(kategori).toEqual(new Set(["TIPS", "TUTORIAL"]));
    expect(res.body.meta.total).toBe(2);
  });

  it("memfilter kategori tunggal", async () => {
    const res = await agent.get("/api/v1/articles?category=UPDATE").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Pembaruan Musim");
  });

  it("menerima kombinasi tipe dan kategori yang konsisten", async () => {
    const res = await agent.get("/api/v1/articles?type=berita&category=ESPORTS").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Liputan Esports Daerah");
  });

  it("menolak kombinasi tipe dan kategori yang bertentangan", async () => {
    const res = await agent.get("/api/v1/articles?type=berita&category=TUTORIAL").expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].field).toBe("category");
  });

  it("menolak tipe yang tidak dikenal", async () => {
    const res = await agent.get("/api/v1/articles?type=galeri").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("menolak kategori yang tidak dikenal", async () => {
    const res = await agent.get("/api/v1/articles?category=HOROR").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("mencari artikel berdasarkan judul", async () => {
    const res = await agent.get("/api/v1/articles?q=aim").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Panduan Aim Latihan");
  });

  it("mencari di dalam satu tipe saja", async () => {
    const res = await agent.get("/api/v1/articles?q=a&type=panduan").expect(200);

    const kategori = res.body.data.items.map((a: { category: string }) => a.category);
    expect(kategori.every((k: string) => k === "TIPS" || k === "TUTORIAL")).toBe(true);
  });

  it("mengembalikan daftar kosong bila pencarian tidak cocok", async () => {
    const res = await agent.get("/api/v1/articles?q=zzzztidakada").expect(200);

    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it("membagi hasil dengan pagination", async () => {
    const halaman1 = await agent.get("/api/v1/articles?limit=2&page=1").expect(200);
    const halaman2 = await agent.get("/api/v1/articles?limit=2&page=2").expect(200);
    const halaman3 = await agent.get("/api/v1/articles?limit=2&page=3").expect(200);

    expect(halaman1.body.data.items).toHaveLength(2);
    expect(halaman1.body.meta).toEqual({ page: 1, limit: 2, total: 5 });
    expect(halaman2.body.data.items).toHaveLength(2);
    expect(halaman3.body.data.items).toHaveLength(1);
  });

  it("menolak limit di luar rentang", async () => {
    const res = await agent.get("/api/v1/articles?limit=100").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("tidak membocorkan artikel DRAFT lewat pencarian judul", async () => {
    const res = await agent.get("/api/v1/articles?q=Belum Terbit").expect(200);
    expect(res.body.data.items).toHaveLength(0);
  });
});

describe("GET /api/v1/articles/:slug", () => {
  it("mengembalikan detail lengkap beserta isi, penulis, dan game", async () => {
    const res = await agent.get(`/api/v1/articles/${slugBerita}`).expect(200);
    const artikel = res.body.data.article;

    expect(artikel.title).toBe("Turnamen Nasional Dibuka");
    expect(artikel.content).toContain("Turnamen Nasional Dibuka");
    expect(artikel.category).toBe("NEWS");
    expect(artikel.author.username).toBe("redaksi_artikel");
    expect(artikel.game.slug).toBeTruthy();
  });

  it("membuka panduan dengan tipe panduan", async () => {
    const res = await agent.get(`/api/v1/articles/${slugPanduan}?type=panduan`).expect(200);
    expect(res.body.data.article.category).toBe("TUTORIAL");
  });

  it("menolak artikel berita lewat jalur panduan", async () => {
    const res = await agent.get(`/api/v1/articles/${slugBerita}?type=panduan`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("menolak artikel panduan lewat jalur berita", async () => {
    const res = await agent.get(`/api/v1/articles/${slugPanduan}?type=berita`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk artikel DRAFT", async () => {
    const res = await agent.get(`/api/v1/articles/${slugDraf}`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk artikel terjadwal di masa depan", async () => {
    const res = await agent.get(`/api/v1/articles/${slugTerjadwal}`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk slug yang tidak ada", async () => {
    const res = await agent.get("/api/v1/articles/artikel-tidak-ada").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("menolak tipe tidak dikenal pada detail", async () => {
    const res = await agent.get(`/api/v1/articles/${slugBerita}?type=galeri`).expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/articles/meta/filters", () => {
  it("menghitung artikel per kategori dan mengabaikan DRAFT", async () => {
    const res = await agent.get("/api/v1/articles/meta/filters").expect(200);

    const peta = new Map(
      res.body.data.categories.map((c: { value: string; count: number }) => [c.value, c.count]),
    );

    expect(peta.get("NEWS")).toBe(1);
    expect(peta.get("UPDATE")).toBe(1);
    expect(peta.get("TIPS")).toBe(1);
    expect(peta.get("TUTORIAL")).toBe(1);
    expect(peta.get("ESPORTS")).toBe(1);
  });

  it("tidak tertangkap sebagai slug artikel", async () => {
    const res = await agent.get("/api/v1/articles/meta/filters").expect(200);
    expect(res.body.success).toBe(true);
  });
});
