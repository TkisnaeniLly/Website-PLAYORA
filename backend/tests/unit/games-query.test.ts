import { describe, expect, it } from "vitest";
import { listGamesQuerySchema } from "../../src/modules/games/games.schema";

describe("Validasi query katalog game", () => {
  it("memberi nilai default saat query kosong", () => {
    const hasil = listGamesQuerySchema.parse({});

    expect(hasil.page).toBe(1);
    expect(hasil.limit).toBe(12);
    expect(hasil.q).toBeUndefined();
    expect(hasil.genre).toBeUndefined();
    expect(hasil.platform).toBeUndefined();
  });

  it("mengubah string angka menjadi number", () => {
    const hasil = listGamesQuerySchema.parse({ page: "3", limit: "24" });

    expect(hasil.page).toBe(3);
    expect(hasil.limit).toBe(24);
  });

  it("memperlakukan string kosong sebagai tidak memfilter", () => {
    const hasil = listGamesQuerySchema.parse({ q: "", genre: "", platform: "" });

    expect(hasil.q).toBeUndefined();
    expect(hasil.genre).toBeUndefined();
    expect(hasil.platform).toBeUndefined();
  });

  it("memangkas spasi di kedua ujung", () => {
    const hasil = listGamesQuerySchema.parse({ q: "  valorant  " });
    expect(hasil.q).toBe("valorant");
  });

  it("menolak halaman nol atau negatif", () => {
    expect(listGamesQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listGamesQuerySchema.safeParse({ page: "-2" }).success).toBe(false);
  });

  it("menolak limit di luar rentang", () => {
    expect(listGamesQuerySchema.safeParse({ limit: "0" }).success).toBe(false);
    expect(listGamesQuerySchema.safeParse({ limit: "49" }).success).toBe(false);
  });

  it("menolak nilai non-numerik", () => {
    expect(listGamesQuerySchema.safeParse({ page: "abc" }).success).toBe(false);
    expect(listGamesQuerySchema.safeParse({ limit: "1.5" }).success).toBe(false);
  });

  it("membuang parameter yang tidak dikenal", () => {
    const hasil = listGamesQuerySchema.parse({ halaman: "9", q: "elden" });
    expect(hasil).not.toHaveProperty("halaman");
    expect(hasil.q).toBe("elden");
  });
});
