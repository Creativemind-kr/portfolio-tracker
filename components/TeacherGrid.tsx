"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface TeacherCardData {
  teacherName: string;
  classCount: number;
  studentCount: number;
  taskCount: number;
  overdue: number;
  color: string;
}

export default function TeacherGrid({ teachers }: { teachers: TeacherCardData[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => t.teacherName.toLowerCase().includes(q));
  }, [teachers, query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && filtered.length > 0) {
      router.push(`/dashboard/teachers/${encodeURIComponent(filtered[0].teacherName)}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="강사명 검색 (Enter로 바로 이동)"
        className="w-64 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Link
              key={t.teacherName}
              href={`/dashboard/teachers/${encodeURIComponent(t.teacherName)}`}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              style={{ borderTopWidth: 4, borderTopColor: t.color }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-zinc-900">{t.teacherName} 강사</h2>
                {t.overdue > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    지연 {t.overdue}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                반 {t.classCount}개 · 학생 {t.studentCount}명 · 작업 {t.taskCount}건
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
