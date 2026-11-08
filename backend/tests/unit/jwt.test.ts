import { describe, expect, it } from "vitest";
import { signAccessToken, verifyAccessToken } from "../../src/utils/jwt";

const DASAR = { sub: "11111111-1111-4111-8111-111111111111", role: "USER" as const };

describe("JWT akses", () => {
  it("menandatangani dan memverifikasi payload lengkap termasuk versi token", () => {
    const token = signAccessToken({ ...DASAR, ver: 3 });
    const hasil = verifyAccessToken(token);

    expect(hasil).not.toBeNull();
    expect(hasil?.sub).toBe(DASAR.sub);
    expect(hasil?.role).toBe("USER");
    expect(hasil?.ver).toBe(3);
    expect(hasil?.type).toBe("access");
  });

  it("menolak token yang dimodifikasi", () => {
    const token = signAccessToken({ ...DASAR, ver: 0 });
    const [kepala, isi, tanda] = token.split(".");
    const isiPalsu = Buffer.from(
      JSON.stringify({ ...JSON.parse(Buffer.from(isi!, "base64url").toString()), role: "ADMIN" }),
    ).toString("base64url");

    expect(verifyAccessToken(`${kepala}.${isiPalsu}.${tanda}`)).toBeNull();
  });

  it("menolak token dengan algoritma none", () => {
    const token = signAccessToken({ ...DASAR, ver: 0 });
    const isi = token.split(".")[1];
    const tanpaTanda = `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")}.${isi}.`;

    expect(verifyAccessToken(tanpaTanda)).toBeNull();
  });

  it("menolak string acak dan string kosong", () => {
    expect(verifyAccessToken("")).toBeNull();
    expect(verifyAccessToken("bukan.token.valid")).toBeNull();
    expect(verifyAccessToken("a.b.c")).toBeNull();
  });

  it("menolak token berjenis selain access", () => {
    expect(verifyAccessToken("eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaCJ9.x")).toBeNull();
  });
});
