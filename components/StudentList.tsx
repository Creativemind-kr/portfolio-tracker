"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentDoc } from "@/lib/types";

export default function StudentList({ students }: { students: StudentDoc[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(s: StudentDoc) {
    setEditingId(s.id);
    setDraftName(s.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName("");
  }

  async function handleSave(id: string) {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        cancelEdit();
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name} 학생과 해당 학생의 작업을 모두 삭제합니다. 계속할까요?`)) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (students.length === 0) {
    return <p className="text-sm text-zinc-500">등록된 학생이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {students.map((s) => (
        <li
          key={s.id}
          className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700"
        >
          {editingId === s.id ? (
            <>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
                className="w-24 rounded-md border border-zinc-300 px-1.5 py-0.5 text-sm outline-none focus:border-zinc-500"
              />
              <button
                onClick={() => handleSave(s.id)}
                disabled={saving}
                className="text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
              >
                저장
              </button>
              <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-600">
                취소
              </button>
            </>
          ) : (
            <>
              {s.name}
              <button
                onClick={() => startEdit(s)}
                className="text-zinc-400 hover:text-zinc-700"
                aria-label={`${s.name} 수정`}
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(s.id, s.name)}
                className="text-zinc-400 hover:text-red-600"
                aria-label={`${s.name} 삭제`}
              >
                ×
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
