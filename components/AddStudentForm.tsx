"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStudentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, name: trimmed }),
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="학생 이름"
        className="w-48 rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        학생 추가
      </button>
    </form>
  );
}
