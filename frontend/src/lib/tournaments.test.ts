import { describe, expect, it } from "vitest";
import {
  buildTournamentParams,
  formatRentangTanggal,
  hitungTotalHalaman,
  labelPeringkat,
} from "./tournaments";

describe("buildTournamentParams", () => {
  it("membuang status kosong", () => {
    expect(buildTournamentParams({ status: "", page: 1 })).toEqual({});
  });

  it("menyertakan status yang dipilih", () => {
    expect(buildTournamentParams({ status: "upcoming" })).toEqual({ status: "upcoming" });
  });

  it("tidak mengirim halaman pertama", () => {
    expect(buildTournamentParams({ page: 1 })).toEqual({});
    expect(buildTournamentParams({ page: 3 })).toEqual({ page: 3 });
  });

  it("menolak halaman atau limit tidak masuk akal", () => {
    expect(buildTournamentParams({ page: 0 })).toEqual({});
    expect(buildTournamentParams({ page: -2 })).toEqual({});
    expect(buildTournamentParams({ limit: 0 })).toEqual({});
    expect(buildTournamentParams({ page: Number.NaN })).toEqual({});
  });

  it("membulatkan angka desimal", () => {
    expect(buildTournamentParams({ page: 2.9, limit: 9.4 })).toEqual({ page: 2, limit: 9 });
  });
});

describe("hitungTotalHalaman", () => {
  it("membulatkan ke atas", () => {
    expect(hitungTotalHalaman(10, 9)).toBe(2);
    expect(hitungTotalHalaman(9, 9)).toBe(1);
  });

  it("mengembalikan minimal satu halaman", () => {
    expect(hitungTotalHalaman(0, 9)).toBe(1);
    expect(hitungTotalHalaman(5, 0)).toBe(1);
  });
});

describe("labelPeringkat", () => {
  it("memakai label khusus untuk juara 1", () => {
    expect(labelPeringkat(1)).toBe("Juara 1");
  });

  it("memakai label peringkat untuk posisi lain", () => {
    expect(labelPeringkat(2)).toBe("Peringkat 2");
    expect(labelPeringkat(3)).toBe("Peringkat 3");
  });
});

describe("formatRentangTanggal", () => {
  it("menampilkan satu tanggal bila mulai dan selesai sama", () => {
    const hasil = formatRentangTanggal("2026-12-05", "2026-12-05");
    expect(hasil).toContain("2026");
    expect(hasil).not.toContain("–");
  });

  it("memampatkan rentang dalam bulan yang sama", () => {
    const hasil = formatRentangTanggal("2026-12-05", "2026-12-07");
    expect(hasil).toContain("–");
    expect(hasil).toContain("2026");
  });

  it("menampilkan dua tanggal penuh untuk bulan berbeda", () => {
    const hasil = formatRentangTanggal("2026-12-28", "2027-01-03");
    expect(hasil.split("–")).toHaveLength(2);
    expect(hasil).toContain("2026");
    expect(hasil).toContain("2027");
  });
});
