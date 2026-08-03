"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClassForm({
  defaultTeacherName,
  teacherOptions,
  lockTeacher,
}: {
  defaultTeacherName?: string;
  teacherOptions?: string[];
  lockTeacher?: boolean;
}) {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState(defaultTeacherName ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedTeacher = teacherName.trim();
    if (!trimmedName || !trimmedTeacher) return;
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, teacherName: trimmedTeacher }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      {!lockTeacher && (
        <>
          <input
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="강사명"
            list="teacher-options"
            className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          {teacherOptions && teacherOptions.length > 0 && (
            <datalist id="teacher-options">
              {teacherOptions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          )}
        </>
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="새 반 이름 (예: 25기 포폴반)"
        className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        반 추가
      </button>
    </form>
  );
}
