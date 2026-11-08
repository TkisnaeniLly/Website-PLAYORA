import { describe, expect, it } from "vitest";
import { buildGamesParams, hitungTotalHalaman } from "./games";

describe("buildGamesParams", () => {
  it("membuang nilai kosong agar URL bersih", () => {
    expect(buildGamesParams({ q: "", platform: "", genre: "", page: 1, limit: 12 })).toEqual({
      limit: 12,
    });
  });

  it("memangkas spasi pada kata kunci", () => {
    expect(buildGamesParams({ q: "  valorant  " })).toEqual({ q: "valorant" });
  });

  it("menyertakan filter yang terisi", () => {
    const hasil = buildGamesParams({ q: "elden", platform: "PC", genre: "Action RPG" });

    expect(hasil).toEqual({ q: "elden", platform: "PC", genre: "Action RPG" });
  });

  it("tidak mengirim halaman pertama karena merupakan default server", () => {
    expect(buildGamesParams({ page: 1 })).toEqual({});
    expect(buildGamesParams({ page: 3 })).toEqual({ page: 3 });
  });

  it("menolak halaman atau limit yang tidak masuk akal", () => {
    expect(buildGamesParams({ page: 0 })).toEqual({});
    expect(buildGamesParams({ page: -5 })).toEqual({});
    expect(buildGamesParams({ page: Number.NaN })).toEqual({});
    expect(buildGamesParams({ limit: 0 })).toEqual({});
    expect(buildGamesParams({ limit: Number.POSITIVE_INFINITY })).toEqual({});
  });

  it("membulatkan angka desimal", () => {
    expect(buildGamesParams({ page: 2.7, limit: 10.9 })).toEqual({ page: 2, limit: 10 });
  });
});

describe("hitungTotalHalaman", () => {
  it("membulatkan ke atas", () => {
    expect(hitungTotalHalaman(13, 12)).toBe(2);
    expect(hitungTotalHalaman(12, 12)).toBe(1);
    expect(hitungTotalHalaman(1, 12)).toBe(1);
  });

  it("mengembalikan minimal satu halaman", () => {
    expect(hitungTotalHalaman(0, 12)).toBe(1);
    expect(hitungTotalHalaman(5, 0)).toBe(1);
  });
});
