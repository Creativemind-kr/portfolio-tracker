import { notFound } from "next/navigation";
import { getClass, listStudents, listTasks } from "@/lib/firestore";
import AddStudentForm from "@/components/AddStudentForm";
import StudentList from "@/components/StudentList";
import RenameClassForm from "@/components/RenameClassForm";
import DeleteClassButton from "@/components/DeleteClassButton";
import TaskBoard from "@/components/TaskBoard";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const cls = await getClass(classId);
  if (!cls) notFound();

  const [students, tasks] = await Promise.all([
    listStudents(classId),
    listTasks({ classId }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <RenameClassForm classId={cls.id} initialName={cls.name} teacherName={cls.teacherName} />
        <DeleteClassButton classId={cls.id} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700">학생 관리</h2>
        <AddStudentForm classId={cls.id} />
        <StudentList students={students} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700">작업 (WBS)</h2>
        <TaskBoard classId={cls.id} students={students} initialTasks={tasks} />
      </section>
    </div>
  );
}
