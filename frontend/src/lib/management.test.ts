import { describe, expect, it } from "vitest";
import {
  LABEL_STATUS_HASIL,
  WARNA_STATUS_HASIL,
  bolehHapusHasil,
  buildAdminTournamentParams,
  rapikanPeringkat,
  validasiHasilLokal,
} from "./management";
import type { ResultEntry } from "@/types/management";

describe("label & warna status hasil", () => {
  it("menyediakan label untuk ketiga status", () => {
    expect(LABEL_STATUS_HASIL.PENDING_REVIEW).toBe("Menunggu Tinjauan");
    expect(LABEL_STATUS_HASIL.APPROVED).toBe("Disetujui");
    expect(LABEL_STATUS_HASIL.REJECTED).toBe("Ditolak");
  });

  it("menyediakan kelas warna berbeda per status", () => {
    const warna = new Set(Object.values(WARNA_STATUS_HASIL));
    expect(warna.size).toBe(3);
  });
});

describe("buildAdminTournamentParams", () => {
  it("membuang filter kosong", () => {
    expect(buildAdminTournamentParams({ status: "", page: 1 })).toEqual({});
  });

  it("menyertakan filter yang dipilih", () => {
    expect(buildAdminTournamentParams({ status: "awaiting_results" })).toEqual({
      status: "awaiting_results",
    });
  });

  it("tidak mengirim halaman pertama", () => {
    expect(buildAdminTournamentParams({ page: 1 })).toEqual({});
    expect(buildAdminTournamentParams({ page: 4 })).toEqual({ page: 4 });
  });

  it("menolak nilai tidak masuk akal", () => {
    expect(buildAdminTournamentParams({ page: 0 })).toEqual({});
    expect(buildAdminTournamentParams({ limit: -1 })).toEqual({});
    expect(buildAdminTournamentParams({ page: Number.NaN })).toEqual({});
  });
});

describe("rapikanPeringkat", () => {
  it("menomori ulang mulai dari 1", () => {
    const masuk: ResultEntry[] = [
      { position: 5, teamOrPlayer: "A" },
      { position: 9, teamOrPlayer: "B" },
    ];

    expect(rapikanPeringkat(masuk)).toEqual([
      { position: 1, teamOrPlayer: "A" },
      { position: 2, teamOrPlayer: "B" },
    ]);
  });

  it("tidak mengubah objek asli", () => {
    const masuk: ResultEntry[] = [{ position: 7, teamOrPlayer: "A" }];
    rapikanPeringkat(masuk);
    expect(masuk[0]?.position).toBe(7);
  });

  it("menangani daftar kosong", () => {
    expect(rapikanPeringkat([])).toEqual([]);
  });
});

describe("validasiHasilLokal", () => {
  it("menolak daftar kosong", () => {
    expect(validasiHasilLokal([])).toBe("Isi minimal satu hasil.");
  });

  it("menolak nama tim terlalu pendek", () => {
    expect(validasiHasilLokal([{ position: 1, teamOrPlayer: "A" }])).toMatch(/minimal 2/);
  });

  it("menolak nama tim berisi spasi saja", () => {
    expect(validasiHasilLokal([{ position: 1, teamOrPlayer: "   " }])).toMatch(/minimal 2/);
  });

  it("menolak peringkat ganda", () => {
    const hasil = validasiHasilLokal([
      { position: 1, teamOrPlayer: "Tim A" },
      { position: 1, teamOrPlayer: "Tim B" },
    ]);
    expect(hasil).toMatch(/ganda/);
  });

  it("menolak peringkat tidak valid", () => {
    expect(validasiHasilLokal([{ position: 0, teamOrPlayer: "Tim A" }])).toMatch(/tidak valid/);
    expect(validasiHasilLokal([{ position: 1.5, teamOrPlayer: "Tim A" }])).toMatch(/tidak valid/);
  });

  it("menerima data yang sah", () => {
    const hasil = validasiHasilLokal([
      { position: 1, teamOrPlayer: "Tim Alpha" },
      { position: 2, teamOrPlayer: "Tim Beta" },
    ]);
    expect(hasil).toBeNull();
  });
});

describe("bolehHapusHasil", () => {
  it("menolak penyelenggara menghapus hasil yang sudah disetujui", () => {
    expect(bolehHapusHasil("APPROVED", "USER")).toBe(false);
  });

  it("mengizinkan penyelenggara menghapus hasil yang belum disetujui", () => {
    expect(bolehHapusHasil("PENDING_REVIEW", "USER")).toBe(true);
    expect(bolehHapusHasil("REJECTED", "USER")).toBe(true);
  });

  it("mengizinkan admin menghapus hasil dengan status apa pun", () => {
    expect(bolehHapusHasil("APPROVED", "ADMIN")).toBe(true);
    expect(bolehHapusHasil("PENDING_REVIEW", "ADMIN")).toBe(true);
  });
});
