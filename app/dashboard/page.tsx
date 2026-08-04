import { listClasses, listStudents, listTasks } from "@/lib/firestore";
import NewClassForm from "@/components/NewClassForm";
import TeacherGrid, { type TeacherCardData } from "@/components/TeacherGrid";
import { colorForIndex } from "@/lib/colors";
import { UNASSIGNED_TEACHER } from "@/lib/types";

export default async function DashboardPage() {
  const [classes, students, tasks] = await Promise.all([
    listClasses(),
    listStudents(),
    listTasks({}),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const teacherNames: string[] = [];
  const classesByTeacher = new Map<string, typeof classes>();
  for (const cls of classes) {
    const teacherName = cls.teacherName || UNASSIGNED_TEACHER;
    if (!classesByTeacher.has(teacherName)) {
      classesByTeacher.set(teacherName, []);
      teacherNames.push(teacherName);
    }
    classesByTeacher.get(teacherName)!.push(cls);
  }
  teacherNames.sort((a, b) => a.localeCompare(b, "ko"));

  const teacherCards: TeacherCardData[] = teacherNames.map((teacherName, index) => {
    const teacherClasses = classesByTeacher.get(teacherName)!;
    const classIds = new Set(teacherClasses.map((c) => c.id));
    const teacherStudents = students.filter((s) => classIds.has(s.classId));
    const teacherTasks = tasks.filter((t) => classIds.has(t.classId));
    const overdue = teacherTasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "submitted" && t.status !== "feedback_done"
    ).length;

    return {
      teacherName,
      classCount: teacherClasses.length,
      studentCount: teacherStudents.length,
      taskCount: teacherTasks.length,
      overdue,
      color: colorForIndex(index),
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">강사별 반 관리</h1>
        <NewClassForm teacherOptions={teacherNames} />
      </div>

      {teacherCards.length === 0 ? (
        <p className="text-sm text-zinc-500">아직 등록된 반이 없습니다. 위에서 강사명과 반 이름을 입력해 추가해보세요.</p>
      ) : (
        <TeacherGrid teachers={teacherCards} />
      )}
    </div>
  );
}
