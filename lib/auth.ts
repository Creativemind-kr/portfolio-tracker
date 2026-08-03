import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Server Components / Route Handlers: verify the session independently of proxy.ts,
// per Next.js guidance to not rely on Proxy alone for auth checks.
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

// Call at the top of each Route Handler; returns a 401 response to short-circuit on, or null if authorized.
export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdminRequest();
  if (ok) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
