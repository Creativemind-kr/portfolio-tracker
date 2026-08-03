import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { renameTeacher } from "@/lib/firestore";

export async function PATCH(request: Request, { params }: { params: Promise<{ teacher: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { teacher } = await params;
  const oldTeacherName = decodeURIComponent(teacher);

  const body = await request.json().catch(() => null);
  const newTeacherName = typeof body?.name === "string" ? body.name.trim() : "";
  if (!newTeacherName) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const updated = await renameTeacher(oldTeacherName, newTeacherName);
  return NextResponse.json({ ok: true, updated });
}
