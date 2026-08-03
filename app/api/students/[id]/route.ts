import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteStudent, updateStudent } from "@/lib/firestore";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const patch: { name?: string; order?: number } = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body?.order === "number") patch.order = body.order;

  await updateStudent(id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await deleteStudent(id);
  return NextResponse.json({ ok: true });
}
