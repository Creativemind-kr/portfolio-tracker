import Link from "next/link";
import { notFound } from "next/navigation";
import { listClasses, listStudents, listTasks } from "@/lib/firestore";
import { TASK_STATUS_LABELS, UNASSIGNED_TEACHER, type TaskStatus } from "@/lib/types";
import NewClassForm from "@/components/NewClassForm";
import RenameTeacherButton from "@/components/RenameTeacherButton";
import { colorForIndex } from "@/lib/colors";

export default async function TeacherClassesPage({
  params,
}: {
  params: Promise<{ teacher: string }>;
}) {
  const { teacher } = await params;
  const teacherName = decodeURIComponent(teacher);

  const [allClasses, allStudents, allTasks] = await Promise.all([
    listClasses(),
    listStudents(),
    listTasks({}),
  ]);

  const classes = allClasses.filter((c) => (c.teacherName || UNASSIGNED_TEACHER) === teacherName);
  if (classes.length === 0) notFound();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600">
          ← 강사별 반 관리
        </Link>
        <RenameTeacherButton teacherName={teacherName} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">반 목록</h2>
        <NewClassForm defaultTeacherName={teacherName} lockTeacher />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls, index) => {
          const classStudents = allStudents.filter((s) => s.classId === cls.id);
          const classTasks = allTasks.filter((t) => t.classId === cls.id);
          const statusCounts: Record<TaskStatus, number> = {
            pending: 0,
            in_progress: 0,
            submitted: 0,
            feedback_done: 0,
          };
          classTasks.forEach((t) => statusCounts[t.status]++);
          const overdue = classTasks.filter(
            (t) => t.dueDate && t.dueDate < today && t.status !== "submitted" && t.status !== "feedback_done"
          ).length;
          const color = colorForIndex(index);

          return (
            <Link
              key={cls.id}
              href={`/dashboard/classes/${cls.id}`}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              style={{ borderTopWidth: 4, borderTopColor: color }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900">{cls.name}</h3>
                {overdue > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    지연 {overdue}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                학생 {classStudents.length}명 · 작업 {classTasks.length}건
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => (
                  <span key={status} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {TASK_STATUS_LABELS[status]} {statusCounts[status]}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
