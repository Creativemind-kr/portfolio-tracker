export type TaskStatus = "pending" | "in_progress" | "submitted" | "feedback_done";

export const TASK_STATUSES: TaskStatus[] = ["pending", "in_progress", "submitted", "feedback_done"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "대기",
  in_progress: "진행중",
  submitted: "제출완료",
  feedback_done: "피드백완료",
};

// Fallback grouping label for classes created before teacherName existed on the schema.
export const UNASSIGNED_TEACHER = "미지정";

export interface ClassDoc {
  id: string;
  name: string;
  teacherName: string;
  order: number;
  createdAt: number;
}

export interface StudentDoc {
  id: string;
  classId: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface TaskDoc {
  id: string;
  classId: string;
  studentId: string;
  title: string;
  description: string;
  dueDate: string | null; // ISO date string (YYYY-MM-DD)
  progress: number; // 0-100
  status: TaskStatus;
  submissionLink: string | null;
  feedbackNote: string;
  createdAt: number;
  updatedAt: number;
}
