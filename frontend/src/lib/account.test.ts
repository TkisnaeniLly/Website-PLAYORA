import { describe, expect, it } from "vitest";
import {
  KELOMPOK_NOTIFIKASI,
  WARNA_NOTIFIKASI,
  buildNotificationParams,
  notificationLink,
} from "./account";
import type { NotificationType } from "@/types/account";

const SEMUA_TIPE: NotificationType[] = [
  "SUBMISSION_CREATED",
  "SUBMISSION_STATUS_CHANGED",
  "SUBMISSION_APPROVED",
  "SUBMISSION_REJECTED",
  "SUBMISSION_NEEDS_REVISION",
  "RESULT_APPROVED",
  "RESULT_REJECTED",
];

describe("buildNotificationParams", () => {
  it("membuang filter kosong", () => {
    expect(buildNotificationParams({ page: 1 })).toEqual({});
  });

  it("mengirim unreadOnly hanya bila true", () => {
    expect(buildNotificationParams({ unreadOnly: true })).toEqual({ unreadOnly: "true" });
    expect(buildNotificationParams({ unreadOnly: false })).toEqual({});
  });

  it("tidak mengirim halaman pertama", () => {
    expect(buildNotificationParams({ page: 1 })).toEqual({});
    expect(buildNotificationParams({ page: 2 })).toEqual({ page: 2 });
  });

  it("menolak nilai tidak masuk akal", () => {
    expect(buildNotificationParams({ page: 0 })).toEqual({});
    expect(buildNotificationParams({ limit: -3 })).toEqual({});
    expect(buildNotificationParams({ page: Number.NaN })).toEqual({});
  });
});

describe("notificationLink", () => {
  it("mengarahkan notifikasi hasil ke halaman kelola hasil", () => {
    expect(notificationLink("RESULT_APPROVED", "t-1")).toBe("/tournaments/t-1/results/manage");
    expect(notificationLink("RESULT_REJECTED", "t-1")).toBe("/tournaments/t-1/results/manage");
  });

  it("mengarahkan notifikasi pengajuan ke detail pengajuan", () => {
    expect(notificationLink("SUBMISSION_CREATED", "s-1")).toBe("/tournaments/submissions/s-1");
    expect(notificationLink("SUBMISSION_APPROVED", "s-1")).toBe("/tournaments/submissions/s-1");
    expect(notificationLink("SUBMISSION_NEEDS_REVISION", "s-1")).toBe(
      "/tournaments/submissions/s-1",
    );
  });

  it("mengembalikan null bila referensi tidak ada", () => {
    expect(notificationLink("RESULT_APPROVED", null)).toBeNull();
    expect(notificationLink("SUBMISSION_CREATED", null)).toBeNull();
  });
});

describe("metadata notifikasi", () => {
  it("setiap tipe punya kelompok dan warna", () => {
    for (const tipe of SEMUA_TIPE) {
      expect(KELOMPOK_NOTIFIKASI[tipe]).toBeTruthy();
      expect(WARNA_NOTIFIKASI[tipe]).toBeTruthy();
    }
  });

  it("membedakan kelompok pengajuan dan hasil", () => {
    expect(KELOMPOK_NOTIFIKASI.SUBMISSION_APPROVED).toBe("Pengajuan");
    expect(KELOMPOK_NOTIFIKASI.RESULT_APPROVED).toBe("Hasil");
  });
});
