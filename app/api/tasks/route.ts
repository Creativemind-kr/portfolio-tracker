import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createTask, listTasks } from "@/lib/firestore";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const params = new URL(request.url).searchParams;
  const classId = params.get("classId") ?? undefined;
  const studentId = params.get("studentId") ?? undefined;
  const statusParam = params.get("status");
  const status = TASK_STATUSES.includes(statusParam as TaskStatus) ? (statusParam as TaskStatus) : undefined;

  const tasks = await listTasks({ classId, studentId, status });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const classId = typeof body?.classId === "string" ? body.classId : "";
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!classId || !studentId || !title) {
    return NextResponse.json({ error: "classId, studentId and title are required" }, { status: 400 });
  }

  const status = TASK_STATUSES.includes(body?.status) ? body.status : undefined;

  const created = await createTask({
    classId,
    studentId,
    title,
    description: typeof body?.description === "string" ? body.description : undefined,
    dueDate: typeof body?.dueDate === "string" ? body.dueDate : null,
    progress: typeof body?.progress === "number" ? body.progress : undefined,
    status,
    submissionLink: typeof body?.submissionLink === "string" ? body.submissionLink : null,
    feedbackNote: typeof body?.feedbackNote === "string" ? body.feedbackNote : undefined,
  });
  return NextResponse.json({ task: created }, { status: 201 });
}
