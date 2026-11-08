import { describe, expect, it } from "vitest";
import {
  LABEL_STATUS_PENGAJUAN,
  URUTAN_STATUS_PENGAJUAN,
  WARNA_STATUS_PENGAJUAN,
  buildSubmissionParams,
  dapatDiajukanUlang,
  rapikanPayload,
} from "./submissions";
import type { SubmissionFormValues } from "@/types/submissions";

describe("dapatDiajukanUlang", () => {
  it("hanya mengizinkan status NEEDS_REVISION", () => {
    expect(dapatDiajukanUlang("NEEDS_REVISION")).toBe(true);
    expect(dapatDiajukanUlang("PENDING")).toBe(false);
    expect(dapatDiajukanUlang("APPROVED")).toBe(false);
    expect(dapatDiajukanUlang("REJECTED")).toBe(false);
  });
});

describe("label & warna status", () => {
  it("menyediakan label untuk keempat status", () => {
    for (const status of URUTAN_STATUS_PENGAJUAN) {
      expect(LABEL_STATUS_PENGAJUAN[status]).toBeTruthy();
      expect(WARNA_STATUS_PENGAJUAN[status]).toBeTruthy();
    }
  });

  it("memakai istilah Indonesia yang konsisten", () => {
    expect(LABEL_STATUS_PENGAJUAN.PENDING).toBe("Menunggu");
    expect(LABEL_STATUS_PENGAJUAN.NEEDS_REVISION).toBe("Perlu Revisi");
    expect(LABEL_STATUS_PENGAJUAN.APPROVED).toBe("Disetujui");
    expect(LABEL_STATUS_PENGAJUAN.REJECTED).toBe("Ditolak");
  });
});

describe("buildSubmissionParams", () => {
  it("membuang status kosong", () => {
    expect(buildSubmissionParams({ status: "", page: 1 })).toEqual({});
  });

  it("menyertakan status yang dipilih", () => {
    expect(buildSubmissionParams({ status: "APPROVED" })).toEqual({ status: "APPROVED" });
  });

  it("tidak mengirim halaman pertama", () => {
    expect(buildSubmissionParams({ page: 1 })).toEqual({});
    expect(buildSubmissionParams({ page: 2 })).toEqual({ page: 2 });
  });

  it("menolak nilai tidak masuk akal", () => {
    expect(buildSubmissionParams({ page: 0 })).toEqual({});
    expect(buildSubmissionParams({ limit: 0 })).toEqual({});
    expect(buildSubmissionParams({ page: Number.NaN })).toEqual({});
  });
});

describe("rapikanPayload", () => {
  const dasar: SubmissionFormValues = {
    title: "  Turnamen Uji  ",
    gameId: "11111111-1111-4111-8111-111111111111",
    organizerName: "  HMIF  ",
    description: "Deskripsi turnamen yang cukup panjang.",
    startDate: "2027-02-10",
    endDate: "2027-02-14",
    registrationDeadline: "",
    format: "5v5",
    teamCount: 16,
    prizePool: "",
    requirements: "",
    registrationMethod: "Formulir daring",
    registrationUrl: "",
    contact: "",
  };

  it("memangkas spasi pada nilai teks", () => {
    const hasil = rapikanPayload(dasar);

    expect(hasil.title).toBe("Turnamen Uji");
    expect(hasil.organizerName).toBe("HMIF");
  });

  it("membuang string kosong agar tidak dikirim ke API", () => {
    const hasil = rapikanPayload(dasar);

    expect(hasil).not.toHaveProperty("registrationDeadline");
    expect(hasil).not.toHaveProperty("prizePool");
    expect(hasil).not.toHaveProperty("requirements");
    expect(hasil).not.toHaveProperty("registrationUrl");
    expect(hasil).not.toHaveProperty("contact");
  });

  it("mempertahankan nilai angka termasuk nol", () => {
    const hasil = rapikanPayload({ ...dasar, teamCount: 0 });
    expect(hasil.teamCount).toBe(0);
  });

  it("mempertahankan field yang terisi", () => {
    const hasil = rapikanPayload({ ...dasar, contact: "08123", prizePool: "Rp1.000.000" });

    expect(hasil.contact).toBe("08123");
    expect(hasil.prizePool).toBe("Rp1.000.000");
  });

  it("membuang nilai null dan undefined", () => {
    const hasil = rapikanPayload({
      ...dasar,
      prizePool: undefined,
      requirements: null as unknown as string,
    });

    expect(hasil).not.toHaveProperty("prizePool");
    expect(hasil).not.toHaveProperty("requirements");
  });
});
