"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RenameTeacherButton({ teacherName }: { teacherName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(teacherName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === teacherName) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${encodeURIComponent(teacherName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        router.push(`/dashboard/teachers/${encodeURIComponent(trimmed)}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
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
            setName(teacherName);
            setEditing(false);
          }}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-xl font-semibold text-zinc-900">{teacherName} 강사</h1>
      <button
        onClick={() => setEditing(true)}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50"
      >
        수정
      </button>
    </div>
  );
}
