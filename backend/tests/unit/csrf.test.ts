import { describe, expect, it } from "vitest";
import {
  createCsrfToken,
  csrfTokensMatch,
  isCsrfTokenWellFormed,
} from "../../src/utils/csrf";
import { parseDurationToMs } from "../../src/config/env";

describe("Token CSRF", () => {
  it("menghasilkan format nonce.tandaTangan yang valid", () => {
    const token = createCsrfToken();
    const bagian = token.split(".");

    expect(bagian).toHaveLength(2);
    expect(bagian[0]!.length).toBeGreaterThanOrEqual(32);
    expect(bagian[1]!.length).toBeGreaterThanOrEqual(32);
    expect(isCsrfTokenWellFormed(token)).toBe(true);
  });

  it("menerbitkan nonce berbeda setiap kali dipanggil", () => {
    const kumpulan = new Set(Array.from({ length: 20 }, () => createCsrfToken()));
    expect(kumpulan.size).toBe(20);
  });

  it("menolak token dengan tanda tangan palsu", () => {
    const token = createCsrfToken();
    const [nonce] = token.split(".");
    const palsu = `${nonce}.tandaTanganPalsuPanjangnyaCukupTapiSalah`;

    expect(isCsrfTokenWellFormed(palsu)).toBe(false);
  });

  it("menolak token yang nonce-nya diubah tanpa menandatangani ulang", () => {
    const token = createCsrfToken();
    const [, tanda] = token.split(".");
    const nonceBaru = "bm9uY2UtYmFydS1zZWNhcmEtcGFuamFuZy1zZWNhcmE";

    expect(isCsrfTokenWellFormed(`${nonceBaru}.${tanda}`)).toBe(false);
  });

  it("menolak token tanpa pemisah atau kosong", () => {
    expect(isCsrfTokenWellFormed("")).toBe(false);
    expect(isCsrfTokenWellFormed("tanpa-titik")).toBe(false);
    expect(isCsrfTokenWellFormed(".hanyaTandaTangan")).toBe(false);
    expect(isCsrfTokenWellFormed("hanyaNonce.")).toBe(false);
  });

  it("membandingkan dua token tanpa membocorkan panjang lewat hasil", () => {
    const a = createCsrfToken();
    const b = createCsrfToken();

    expect(csrfTokensMatch(a, a)).toBe(true);
    expect(csrfTokensMatch(a, b)).toBe(false);
    expect(csrfTokensMatch(a, "pendek")).toBe(false);
  });
});

describe("parseDurationToMs", () => {
  it("mengubah satuan waktu yang didukung", () => {
    expect(parseDurationToMs("45s")).toBe(45_000);
    expect(parseDurationToMs("30m")).toBe(1_800_000);
    expect(parseDurationToMs("12h")).toBe(43_200_000);
    expect(parseDurationToMs("7d")).toBe(604_800_000);
  });

  it("mengembalikan 7 hari untuk format yang tidak dikenali", () => {
    expect(parseDurationToMs("tidak-valid")).toBe(604_800_000);
    expect(parseDurationToMs("")).toBe(604_800_000);
  });
});
