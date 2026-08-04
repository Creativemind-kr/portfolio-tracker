"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/types";

export interface ClassCardData {
  id: string;
  name: string;
  studentCount: number;
  taskCount: number;
  statusCounts: Record<TaskStatus, number>;
  overdue: number;
  color: string;
}

export default function ClassGrid({ classes }: { classes: ClassCardData[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(q));
  }, [classes, query]);

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="반 이름 검색"
        className="w-64 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cls) => (
            <Link
              key={cls.id}
              href={`/dashboard/classes/${cls.id}`}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              style={{ borderTopWidth: 4, borderTopColor: cls.color }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900">{cls.name}</h3>
                {cls.overdue > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    지연 {cls.overdue}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                학생 {cls.studentCount}명 · 작업 {cls.taskCount}건
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => (
                  <span key={status} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {TASK_STATUS_LABELS[status]} {cls.statusCounts[status]}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
