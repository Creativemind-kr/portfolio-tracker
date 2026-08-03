"use client";

import { useState } from "react";
import type { StudentDoc, TaskDoc, TaskStatus } from "@/lib/types";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/types";
import { getDrivePreviewUrl } from "@/lib/driveLink";

export default function TaskModal({
  classId,
  students,
  initialTask,
  onClose,
  onSaved,
}: {
  classId: string;
  students: StudentDoc[];
  initialTask: TaskDoc | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initialTask;
  const [studentId, setStudentId] = useState(initialTask?.studentId ?? students[0]?.id ?? "");
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? "");
  const [progress, setProgress] = useState(initialTask?.progress ?? 0);
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "pending");
  const [submissionLink, setSubmissionLink] = useState(initialTask?.submissionLink ?? "");
  const [feedbackNote, setFeedbackNote] = useState(initialTask?.feedbackNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = submissionLink ? getDrivePreviewUrl(submissionLink) : null;

  async function handleSave() {
    if (!studentId || !title.trim()) {
      setError("담당 학생과 제목은 필수입니다.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        classId,
        studentId,
        title: title.trim(),
        description,
        dueDate: dueDate || null,
        progress,
        status,
        submissionLink: submissionLink.trim() || null,
        feedbackNote,
      };
      const res = await fetch(isEdit ? `/api/tasks/${initialTask!.id}` : "/api/tasks", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("저장에 실패했습니다.");
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-zinc-900">{isEdit ? "작업 수정" : "새 작업 추가"}</h3>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">담당 학생</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">내용</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">기한</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">진행율: {progress}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">제출 링크 (드라이브 공유 링크)</label>
          <input
            value={submissionLink}
            onChange={(e) => setSubmissionLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          {submissionLink && !previewUrl && (
            <a
              href={submissionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              새 창에서 열기 (미리보기 미지원 링크)
            </a>
          )}
        </div>

        {previewUrl && (
          <div className="overflow-hidden rounded-md border border-zinc-200">
            <iframe src={previewUrl} className="h-72 w-full" allow="autoplay" />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">강사 피드백 / 수정요청 메모</label>
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            rows={3}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
