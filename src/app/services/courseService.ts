import { apiFetch } from "../lib/apiFetch";

export type CourseStatus   = "In Progress" | "Completed" | "Not Started" | "active" | "archived";
export type CourseType     = "academic" | "private";
export type ApprovalStatus = "pending_approval" | "approved" | "rejected";

export type Course = {
  _id: string; title: string;
  instructor: string | { _id: string; username: string; email: string };
  duration: string; students: number; rating: number; progress: number;
  status: CourseStatus; image: string; enrolledStudents?: string[]; description?: string;
  courseType: CourseType; isFree: boolean; price: number;
  approvalStatus: ApprovalStatus; rejectionNote?: string;
  department?: any; semesterNumber?: number | null; subjectCode?: string; credits?: number;
};

const normaliseCourse = (c: any): Course => ({
  _id: c._id, title: c.title || "",
  instructor: typeof c.instructor === "object" && c.instructor !== null ? c.instructor : (c.instructor || ""),
  duration: c.duration || "", students: c.enrolledStudents?.length ?? c.students ?? 0,
  rating: c.rating ?? 4.5, progress: c.progress ?? 0, status: c.status || "active", image: c.image || "",
  description: c.description || "", courseType: c.courseType || "private",
  isFree: c.isFree ?? true, price: c.price ?? 0,
  approvalStatus: c.approvalStatus || "pending_approval", rejectionNote: c.rejectionNote || "",
  department: c.department ?? null, semesterNumber: c.semesterNumber ?? null,
  subjectCode: c.subjectCode || "", credits: c.credits ?? 0,
});

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
};

export const getCourses = async (): Promise<Course[]> => {
  const data = await handle<any>(await apiFetch("/api/courses?limit=100"));
  return (Array.isArray(data) ? data : (data.courses ?? [])).map(normaliseCourse);
};

export const getCourseById = async (id: string): Promise<Course> =>
  normaliseCourse(await handle<any>(await apiFetch(`/api/courses/${id}`)));

export const createCourse = async (data: {
  title: string; duration: string; description?: string; courseType?: CourseType;
  isFree?: boolean; price?: number; department?: string | null;
  semesterNumber?: number | null; subjectCode?: string; credits?: number;
}): Promise<Course> =>
  normaliseCourse(await handle<any>(await apiFetch("/api/courses", { method: "POST", body: JSON.stringify(data) })));

export const updateCourse = async (id: string, data: Partial<Course>): Promise<Course> =>
  normaliseCourse(await handle<any>(await apiFetch(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(data) })));

export const deleteCourse = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/courses/${id}`, { method: "DELETE" });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || "Delete failed"); }
};

export const enrollInCourse = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/courses/${id}/enroll`, { method: "POST" });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || "Enroll failed"); }
};