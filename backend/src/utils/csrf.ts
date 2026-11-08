import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";

const PEMISAH = ".";

function tandaTangan(nonce: string): string {
  return createHmac("sha256", env.CSRF_SECRET).update(nonce).digest("base64url");
}

function samaPersis(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Signed double-submit cookie: `nonce.tandaTanganHMAC`.
 * Tanpa CSRF_SECRET, penyerang tidak dapat memalsukan pasangan yang valid
 * walau ia mampu menanam cookie sendiri di subdomain.
 */
export function createCsrfToken(): string {
  const nonce = randomBytes(32).toString("base64url");
  return `${nonce}${PEMISAH}${tandaTangan(nonce)}`;
}

export function isCsrfTokenWellFormed(token: string): boolean {
  const bagian = token.split(PEMISAH);
  if (bagian.length !== 2) return false;

  const nonce = bagian[0];
  const signature = bagian[1];
  if (!nonce || !signature) return false;

  return samaPersis(signature, tandaTangan(nonce));
}

export function csrfTokensMatch(cookieToken: string, headerToken: string): boolean {
  return samaPersis(cookieToken, headerToken);
}
