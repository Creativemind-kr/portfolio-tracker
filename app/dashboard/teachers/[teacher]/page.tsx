import Link from "next/link";
import { notFound } from "next/navigation";
import { listClasses, listStudents, listTasks } from "@/lib/firestore";
import { UNASSIGNED_TEACHER, type TaskStatus } from "@/lib/types";
import NewClassForm from "@/components/NewClassForm";
import RenameTeacherButton from "@/components/RenameTeacherButton";
import ClassGrid, { type ClassCardData } from "@/components/ClassGrid";
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

  const sortedClasses = [...classes].sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const classCards: ClassCardData[] = sortedClasses.map((cls, index) => {
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

    return {
      id: cls.id,
      name: cls.name,
      studentCount: classStudents.length,
      taskCount: classTasks.length,
      statusCounts,
      overdue,
      color: colorForIndex(index),
    };
  });

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

      <ClassGrid classes={classCards} />
    </div>
  );
}
