import { NextResponse } from "next/server";
import { createSessionToken, verifyCredentials, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!id || !password || !verifyCredentials(id, password)) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
