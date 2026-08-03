"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentDoc, TaskDoc, TaskStatus } from "@/lib/types";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/types";
import TaskModal from "@/components/TaskModal";

const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  pending: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-amber-100 text-amber-700",
  feedback_done: "bg-green-100 text-green-700",
};

export default function TaskBoard({
  classId,
  students,
  initialTasks,
}: {
  classId: string;
  students: StudentDoc[];
  initialTasks: TaskDoc[];
}) {
  const router = useRouter();
  const tasks = initialTasks;

  const [filterStudent, setFilterStudent] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [modalState, setModalState] = useState<{ mode: "create" } | { mode: "edit"; task: TaskDoc } | null>(null);

  const studentNameById = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [students]);

  const today = new Date().toISOString().slice(0, 10);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => !filterStudent || t.studentId === filterStudent)
      .filter((t) => !filterStatus || t.status === filterStatus)
      .sort((a, b) => {
        const nameA = studentNameById.get(a.studentId) ?? "";
        const nameB = studentNameById.get(b.studentId) ?? "";
        if (nameA !== nameB) return nameA.localeCompare(nameB, "ko");
        return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      });
  }, [tasks, filterStudent, filterStatus, studentNameById]);

  async function handleDelete(id: string) {
    if (!confirm("이 작업을 삭제할까요?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          >
            <option value="">전체 학생</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          >
            <option value="">전체 상태</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setModalState({ mode: "create" })}
          disabled={students.length === 0}
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          title={students.length === 0 ? "먼저 학생을 추가하세요" : undefined}
        >
          + 새 작업
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          표시할 작업이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-500">
                <th className="px-3 py-2 font-medium">학생</th>
                <th className="px-3 py-2 font-medium">작업</th>
                <th className="px-3 py-2 font-medium">기한</th>
                <th className="px-3 py-2 font-medium">진행율</th>
                <th className="px-3 py-2 font-medium">상태</th>
                <th className="px-3 py-2 font-medium">제출</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const overdue =
                  task.dueDate &&
                  task.dueDate < today &&
                  task.status !== "submitted" &&
                  task.status !== "feedback_done";
                return (
                  <tr
                    key={task.id}
                    className="cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                    onClick={() => setModalState({ mode: "edit", task })}
                  >
                    <td className="px-3 py-2 text-zinc-700">{studentNameById.get(task.studentId) ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-900">{task.title}</td>
                    <td className={`px-3 py-2 ${overdue ? "font-medium text-red-600" : "text-zinc-500"}`}>
                      {task.dueDate ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full bg-zinc-900" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[task.status]}`}>
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {task.submissionLink ? (
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline"
                        >
                          열기
                        </a>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="text-zinc-400 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalState && (
        <TaskModal
          classId={classId}
          students={students}
          initialTask={modalState.mode === "edit" ? modalState.task : null}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
