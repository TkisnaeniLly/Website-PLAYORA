import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

const ISSUER = "playora";
const AUDIENCE = "playora-web";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  ver: number;
  type: "access";
}

export function signAccessToken(input: { sub: string; role: Role; ver: number }): string {
  return jwt.sign({ ...input, type: "access" }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (typeof decoded !== "object" || decoded === null) return null;

    const { sub, role, ver, type } = decoded as Record<string, unknown>;
    if (typeof sub !== "string" || sub.length === 0) return null;
    if (type !== "access") return null;
    if (role !== "USER" && role !== "ADMIN") return null;
    if (typeof ver !== "number" || !Number.isInteger(ver) || ver < 0) return null;

    return { sub, role, ver, type: "access" };
  } catch {
    return null;
  }
}
