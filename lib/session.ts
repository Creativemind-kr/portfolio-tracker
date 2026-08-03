import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "ptrack_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  admin: true;
  exp: number; // epoch ms
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing env var: SESSION_SECRET");
  return secret;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createSessionToken(): string {
  const payload: SessionPayload = {
    admin: true,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const data = base64url(Buffer.from(JSON.stringify(payload)));
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [data, signature] = token.split(".");
  if (!data || !signature) return false;

  const expectedSignature = sign(data);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    return payload.admin === true && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};

export function hashPassword(password: string): string {
  const pepper = process.env.AUTH_PEPPER ?? "";
  return crypto.createHash("sha256").update(password + pepper).digest("hex");
}

export function verifyCredentials(id: string, password: string): boolean {
  const expectedId = process.env.ADMIN_ID;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedId || !expectedHash) return false;
  if (id !== expectedId) return false;

  const actualHash = hashPassword(password);
  const actualBuf = Buffer.from(actualHash);
  const expectedBuf = Buffer.from(expectedHash);
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}
