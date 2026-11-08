import { describe, expect, it } from "vitest";
import {
  DAFTAR_PLATFORM,
  LABEL_KATEGORI,
  LABEL_STATUS,
  LABEL_STATUS_PENGAJUAN,
  WARNA_STATUS,
  WARNA_STATUS_PENGAJUAN,
  buildAdminParams,
  formatTanggal,
  keSlug,
} from "./admin";

describe("buildAdminParams", () => {
  it("membuang pencarian kosong", () => {
    expect(buildAdminParams({ q: "   " })).toEqual({});
  });

  it("memasukkan pencarian dan filter yang dipilih", () => {
    expect(buildAdminParams({ q: "valorant", status: "DRAFT", role: "ADMIN" })).toEqual({
      q: "valorant",
      status: "DRAFT",
      role: "ADMIN",
    });
  });

  it("tidak mengirim halaman pertama", () => {
    expect(buildAdminParams({ page: 1 })).toEqual({});
    expect(buildAdminParams({ page: 3 })).toEqual({ page: 3 });
  });

  it("menolak nilai tidak masuk akal", () => {
    expect(buildAdminParams({ page: 0 })).toEqual({});
    expect(buildAdminParams({ limit: -1 })).toEqual({});
    expect(buildAdminParams({ page: Number.NaN })).toEqual({});
  });
});

describe("keSlug", () => {
  it("mengubah judul menjadi slug url", () => {
    expect(keSlug("Mobile Legends: Bang Bang")).toBe("mobile-legends-bang-bang");
  });

  it("menghapus aksen", () => {
    expect(keSlug("Game Présence")).toBe("game-presence");
  });

  it("menghapus tanda baca dan spasi berlebih", () => {
    expect(keSlug("  Valorant  (2024)  ")).toBe("valorant-2024");
  });
});

describe("label status", () => {
  it("menyediakan label untuk DRAFT dan PUBLISHED", () => {
    expect(LABEL_STATUS.DRAFT).toBe("Draf");
    expect(LABEL_STATUS.PUBLISHED).toBe("Terbit");
  });

  it("menyediakan warna berbeda per status", () => {
    expect(WARNA_STATUS.DRAFT).not.toBe(WARNA_STATUS.PUBLISHED);
  });

  it("menyediakan label status pengajuan", () => {
    expect(LABEL_STATUS_PENGAJUAN.PENDING).toBe("Menunggu");
    expect(LABEL_STATUS_PENGAJUAN.NEEDS_REVISION).toBe("Perlu revisi");
    expect(WARNA_STATUS_PENGAJUAN.APPROVED).not.toBe(WARNA_STATUS_PENGAJUAN.REJECTED);
  });

  it("menyediakan label lima kategori artikel", () => {
    expect(Object.keys(LABEL_KATEGORI)).toHaveLength(5);
    expect(LABEL_KATEGORI.NEWS).toBe("Berita");
    expect(LABEL_KATEGORI.ESPORTS).toBe("Esports");
  });
});

describe("formatTanggal", () => {
  it("menampilkan tanda hubung bila tanggal kosong", () => {
    expect(formatTanggal(null)).toBe("—");
  });

  it("memformat tanggal menjadi bahasa Indonesia", () => {
    expect(formatTanggal("2026-11-05T00:00:00.000Z")).toMatch(/2026/);
  });
});

describe("DAFTAR_PLATFORM", () => {
  it("memuat lima platform yang dipakai katalog", () => {
    expect(DAFTAR_PLATFORM).toHaveLength(5);
    expect(DAFTAR_PLATFORM).toContain("PC");
    expect(DAFTAR_PLATFORM).toContain("Mobile");
  });
});
