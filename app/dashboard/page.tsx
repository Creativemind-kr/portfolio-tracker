import Link from "next/link";
import { listClasses, listStudents, listTasks } from "@/lib/firestore";
import NewClassForm from "@/components/NewClassForm";
import { colorForIndex } from "@/lib/colors";
import { UNASSIGNED_TEACHER } from "@/lib/types";

export default async function DashboardPage() {
  const [classes, students, tasks] = await Promise.all([
    listClasses(),
    listStudents(),
    listTasks({}),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const teacherOrder: string[] = [];
  const classesByTeacher = new Map<string, typeof classes>();
  for (const cls of classes) {
    const teacherName = cls.teacherName || UNASSIGNED_TEACHER;
    if (!classesByTeacher.has(teacherName)) {
      classesByTeacher.set(teacherName, []);
      teacherOrder.push(teacherName);
    }
    classesByTeacher.get(teacherName)!.push(cls);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">강사별 반 관리</h1>
        <NewClassForm teacherOptions={teacherOrder} />
      </div>

      {teacherOrder.length === 0 ? (
        <p className="text-sm text-zinc-500">아직 등록된 반이 없습니다. 위에서 강사명과 반 이름을 입력해 추가해보세요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teacherOrder.map((teacherName, index) => {
            const teacherClasses = classesByTeacher.get(teacherName)!;
            const classIds = new Set(teacherClasses.map((c) => c.id));
            const teacherStudents = students.filter((s) => classIds.has(s.classId));
            const teacherTasks = tasks.filter((t) => classIds.has(t.classId));
            const overdue = teacherTasks.filter(
              (t) => t.dueDate && t.dueDate < today && t.status !== "submitted" && t.status !== "feedback_done"
            ).length;
            const color = colorForIndex(index);

            return (
              <Link
                key={teacherName}
                href={`/dashboard/teachers/${encodeURIComponent(teacherName)}`}
                className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                style={{ borderTopWidth: 4, borderTopColor: color }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-zinc-900">{teacherName} 강사</h2>
                  {overdue > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      지연 {overdue}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500">
                  반 {teacherClasses.length}개 · 학생 {teacherStudents.length}명 · 작업 {teacherTasks.length}건
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
