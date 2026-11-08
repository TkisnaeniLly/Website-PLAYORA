import { describe, expect, it } from "vitest";
import {
  LABEL_STATUS_RUANG,
  buildDiscordRoomParams,
  formatAnggota,
} from "./discord";

describe("buildDiscordRoomParams", () => {
  it("membuang kata kunci kosong dan halaman pertama", () => {
    expect(buildDiscordRoomParams({ q: "   ", page: 1 })).toEqual({});
  });

  it("menyertakan kata kunci yang diisi", () => {
    expect(buildDiscordRoomParams({ q: " valorant " })).toEqual({ q: "valorant" });
  });

  it("menyertakan halaman dan limit yang valid", () => {
    expect(buildDiscordRoomParams({ page: 2, limit: 9 })).toEqual({ page: 2, limit: 9 });
  });

  it("menolak angka tidak masuk akal", () => {
    expect(buildDiscordRoomParams({ page: 0, limit: 0 })).toEqual({});
    expect(buildDiscordRoomParams({ page: Number.NaN })).toEqual({});
  });
});

describe("formatAnggota", () => {
  it("mengembalikan null bila jumlah tidak diketahui", () => {
    expect(formatAnggota(null)).toBeNull();
  });

  it("memformat ribuan dengan pemisah Indonesia", () => {
    expect(formatAnggota(1250)).toBe("1.250 anggota");
  });

  it("menampilkan nol anggota", () => {
    expect(formatAnggota(0)).toBe("0 anggota");
  });
});

describe("LABEL_STATUS_RUANG", () => {
  it("memakai label bahasa Indonesia", () => {
    expect(LABEL_STATUS_RUANG.PENDING).toBe("Menunggu validasi");
    expect(LABEL_STATUS_RUANG.APPROVED).toBe("Tampil");
    expect(LABEL_STATUS_RUANG.REJECTED).toBe("Ditolak");
  });
});
