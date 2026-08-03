import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClass, listClasses } from "@/lib/firestore";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const classes = await listClasses();
  return NextResponse.json({ classes });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const teacherName = typeof body?.teacherName === "string" ? body.teacherName.trim() : "";
  if (!name || !teacherName) {
    return NextResponse.json({ error: "name and teacherName are required" }, { status: 400 });
  }

  const created = await createClass(name, teacherName);
  return NextResponse.json({ class: created }, { status: 201 });
}
