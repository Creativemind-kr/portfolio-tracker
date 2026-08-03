"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UNASSIGNED_TEACHER } from "@/lib/types";

export default function RenameClassForm({
  classId,
  initialName,
  teacherName,
}: {
  classId: string;
  initialName: string;
  teacherName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [teacher, setTeacher] = useState(teacherName || UNASSIGNED_TEACHER);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedTeacher = teacher.trim();
    if (!trimmedName || !trimmedTeacher) return;
    if (trimmedName === initialName && trimmedTeacher === teacherName) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, teacherName: trimmedTeacher }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        href={`/dashboard/teachers/${encodeURIComponent(teacherName || UNASSIGNED_TEACHER)}`}
        className="text-xs text-zinc-400 hover:text-zinc-600"
      >
        ← {teacherName || UNASSIGNED_TEACHER} 강사
      </Link>
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="강사명"
            className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="rounded-md border border-zinc-300 px-2 py-1 text-xl font-semibold outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            저장
          </button>
          <button
            onClick={() => {
              setName(initialName);
              setTeacher(teacherName || UNASSIGNED_TEACHER);
              setEditing(false);
            }}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-zinc-900">{initialName}</h1>
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50"
          >
            수정
          </button>
        </div>
      )}
    </div>
  );
}
