import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteTask, updateTask, type UpdateTaskInput } from "@/lib/firestore";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const patch: UpdateTaskInput = {};

  if (typeof body?.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body?.description === "string") patch.description = body.description;
  if (typeof body?.dueDate === "string" || body?.dueDate === null) patch.dueDate = body.dueDate;
  if (typeof body?.progress === "number") patch.progress = body.progress;
  if (TASK_STATUSES.includes(body?.status as TaskStatus)) patch.status = body.status as TaskStatus;
  if (typeof body?.submissionLink === "string" || body?.submissionLink === null) {
    patch.submissionLink = body.submissionLink;
  }
  if (typeof body?.feedbackNote === "string") patch.feedbackNote = body.feedbackNote;

  await updateTask(id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await deleteTask(id);
  return NextResponse.json({ ok: true });
}
