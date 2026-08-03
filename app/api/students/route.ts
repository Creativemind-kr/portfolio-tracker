import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createStudent, listStudents } from "@/lib/firestore";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const classId = new URL(request.url).searchParams.get("classId") ?? undefined;
  const students = await listStudents(classId);
  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const classId = typeof body?.classId === "string" ? body.classId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!classId || !name) {
    return NextResponse.json({ error: "classId and name are required" }, { status: 400 });
  }

  const created = await createStudent(classId, name);
  return NextResponse.json({ student: created }, { status: 201 });
}
