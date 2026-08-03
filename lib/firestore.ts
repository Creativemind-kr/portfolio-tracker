import { getDb } from "@/lib/firebaseAdmin";
import { UNASSIGNED_TEACHER, type ClassDoc, type StudentDoc, type TaskDoc, type TaskStatus } from "@/lib/types";

const CLASSES = "classes";
const STUDENTS = "students";
const TASKS = "tasks";

// ---- classes ----

export async function listClasses(): Promise<ClassDoc[]> {
  const snap = await getDb().collection(CLASSES).orderBy("order", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassDoc));
}

export async function getClass(id: string): Promise<ClassDoc | null> {
  const doc = await getDb().collection(CLASSES).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as ClassDoc;
}

export async function createClass(name: string, teacherName: string): Promise<ClassDoc> {
  const now = Date.now();
  const ref = await getDb().collection(CLASSES).add({ name, teacherName, order: now, createdAt: now });
  return { id: ref.id, name, teacherName, order: now, createdAt: now };
}

export async function updateClass(
  id: string,
  patch: Partial<Pick<ClassDoc, "name" | "teacherName" | "order">>
): Promise<void> {
  await getDb().collection(CLASSES).doc(id).update(patch);
}

// Bulk-renames every class under `oldTeacherName` (matching missing teacherName
// against UNASSIGNED_TEACHER too) to `newTeacherName`. Returns how many were updated.
export async function renameTeacher(oldTeacherName: string, newTeacherName: string): Promise<number> {
  const db = getDb();
  const snap = await db.collection(CLASSES).get();
  const matching = snap.docs.filter((d) => (d.data().teacherName || UNASSIGNED_TEACHER) === oldTeacherName);
  if (matching.length === 0) return 0;

  const batch = db.batch();
  matching.forEach((d) => batch.update(d.ref, { teacherName: newTeacherName }));
  await batch.commit();
  return matching.length;
}

export async function deleteClass(id: string): Promise<void> {
  const db = getDb();
  const studentsSnap = await db.collection(STUDENTS).where("classId", "==", id).get();
  const tasksSnap = await db.collection(TASKS).where("classId", "==", id).get();

  const batch = db.batch();
  batch.delete(db.collection(CLASSES).doc(id));
  studentsSnap.docs.forEach((d) => batch.delete(d.ref));
  tasksSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ---- students ----

export async function listStudents(classId?: string): Promise<StudentDoc[]> {
  const db = getDb();
  const query = classId
    ? db.collection(STUDENTS).where("classId", "==", classId)
    : db.collection(STUDENTS);
  const snap = await query.get();
  const students = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StudentDoc));
  students.sort((a, b) => a.order - b.order);
  return students;
}

export async function createStudent(classId: string, name: string): Promise<StudentDoc> {
  const now = Date.now();
  const ref = await getDb().collection(STUDENTS).add({ classId, name, order: now, createdAt: now });
  return { id: ref.id, classId, name, order: now, createdAt: now };
}

export async function updateStudent(id: string, patch: Partial<Pick<StudentDoc, "name" | "order">>): Promise<void> {
  await getDb().collection(STUDENTS).doc(id).update(patch);
}

export async function deleteStudent(id: string): Promise<void> {
  const db = getDb();
  const tasksSnap = await db.collection(TASKS).where("studentId", "==", id).get();
  const batch = db.batch();
  batch.delete(db.collection(STUDENTS).doc(id));
  tasksSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ---- tasks ----

export interface TaskFilter {
  classId?: string;
  studentId?: string;
  status?: TaskStatus;
}

export async function listTasks(filter: TaskFilter): Promise<TaskDoc[]> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection(TASKS);
  if (filter.classId) query = query.where("classId", "==", filter.classId);
  if (filter.studentId) query = query.where("studentId", "==", filter.studentId);
  if (filter.status) query = query.where("status", "==", filter.status);

  const snap = await query.get();
  const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TaskDoc));
  tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  return tasks;
}

export interface CreateTaskInput {
  classId: string;
  studentId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  progress?: number;
  status?: TaskStatus;
  submissionLink?: string | null;
  feedbackNote?: string;
}

export async function createTask(input: CreateTaskInput): Promise<TaskDoc> {
  const now = Date.now();
  const doc: Omit<TaskDoc, "id"> = {
    classId: input.classId,
    studentId: input.studentId,
    title: input.title,
    description: input.description ?? "",
    dueDate: input.dueDate ?? null,
    progress: clampProgress(input.progress ?? 0),
    status: input.status ?? "pending",
    submissionLink: input.submissionLink ?? null,
    feedbackNote: input.feedbackNote ?? "",
    createdAt: now,
    updatedAt: now,
  };
  const ref = await getDb().collection(TASKS).add(doc);
  return { id: ref.id, ...doc };
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  progress?: number;
  status?: TaskStatus;
  submissionLink?: string | null;
  feedbackNote?: string;
}

export async function updateTask(id: string, patch: UpdateTaskInput): Promise<void> {
  const update: Record<string, unknown> = { ...patch, updatedAt: Date.now() };
  if (typeof patch.progress === "number") update.progress = clampProgress(patch.progress);
  await getDb().collection(TASKS).doc(id).update(update);
}

export async function deleteTask(id: string): Promise<void> {
  await getDb().collection(TASKS).doc(id).delete();
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
