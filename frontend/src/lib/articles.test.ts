import { describe, expect, it } from "vitest";
import {
  KATEGORI_PER_TIPE,
  LABEL_KATEGORI,
  articlePath,
  buildArticleParams,
  hitungTotalHalamanArtikel,
  tipeUntukKategori,
} from "./articles";

describe("articlePath", () => {
  it("mengarahkan kategori berita ke /news", () => {
    expect(articlePath("NEWS", "judul-berita")).toBe("/news/judul-berita");
    expect(articlePath("UPDATE", "pembaruan")).toBe("/news/pembaruan");
    expect(articlePath("ESPORTS", "liputan")).toBe("/news/liputan");
  });

  it("mengarahkan kategori panduan ke /guides", () => {
    expect(articlePath("TIPS", "tips-aim")).toBe("/guides/tips-aim");
    expect(articlePath("TUTORIAL", "panduan-memulai")).toBe("/guides/panduan-memulai");
  });

  it("tetap menghasilkan jalur yang masuk akal untuk kategori tak dikenal", () => {
    expect(articlePath("TIDAK_DIKENAL", "slug")).toBe("/guides/slug");
  });
});

describe("tipeUntukKategori", () => {
  it("memetakan setiap kategori ke tipe yang benar", () => {
    expect(tipeUntukKategori("NEWS")).toBe("berita");
    expect(tipeUntukKategori("UPDATE")).toBe("berita");
    expect(tipeUntukKategori("ESPORTS")).toBe("berita");
    expect(tipeUntukKategori("TIPS")).toBe("panduan");
    expect(tipeUntukKategori("TUTORIAL")).toBe("panduan");
  });

  it("mencakup kelima kategori tanpa sisa", () => {
    const semua = [...KATEGORI_PER_TIPE.berita, ...KATEGORI_PER_TIPE.panduan];
    expect(semua).toHaveLength(5);
    expect(new Set(semua).size).toBe(5);
    for (const kategori of semua) {
      expect(LABEL_KATEGORI[kategori]).toBeTruthy();
    }
  });
});

describe("buildArticleParams", () => {
  it("membuang nilai kosong", () => {
    expect(buildArticleParams({ q: "", category: "", page: 1 })).toEqual({});
  });

  it("memangkas spasi kata kunci", () => {
    expect(buildArticleParams({ q: "  aim  " })).toEqual({ q: "aim" });
  });

  it("menyertakan tipe dan kategori", () => {
    expect(buildArticleParams({ type: "berita", category: "NEWS" })).toEqual({
      type: "berita",
      category: "NEWS",
    });
  });

  it("tidak mengirim halaman pertama", () => {
    expect(buildArticleParams({ page: 1 })).toEqual({});
    expect(buildArticleParams({ page: 2 })).toEqual({ page: 2 });
  });

  it("menolak halaman atau limit tidak masuk akal", () => {
    expect(buildArticleParams({ page: 0 })).toEqual({});
    expect(buildArticleParams({ page: -1 })).toEqual({});
    expect(buildArticleParams({ limit: 0 })).toEqual({});
    expect(buildArticleParams({ page: Number.NaN })).toEqual({});
  });

  it("membulatkan angka desimal", () => {
    expect(buildArticleParams({ page: 3.9, limit: 9.5 })).toEqual({ page: 3, limit: 9 });
  });
});

describe("hitungTotalHalamanArtikel", () => {
  it("membulatkan ke atas", () => {
    expect(hitungTotalHalamanArtikel(10, 9)).toBe(2);
    expect(hitungTotalHalamanArtikel(9, 9)).toBe(1);
  });

  it("mengembalikan minimal satu halaman", () => {
    expect(hitungTotalHalamanArtikel(0, 9)).toBe(1);
    expect(hitungTotalHalamanArtikel(4, 0)).toBe(1);
  });
});
