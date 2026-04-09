import { apiFetch } from "../lib/apiFetch";

export type AssignmentStatus   = "Not Started" | "In Progress" | "Submitted";
export type AssignmentPriority = "high" | "medium" | "low";
export type AssignmentType     = "Project" | "Quiz" | "Lab";

export type Assignment = {
  _id:         string;
  title:       string;
  description: string;
  course:      string | { _id: string; title: string };
  dueDate:     string;
  maxMarks:    number;
  type:        AssignmentType;
  status:      AssignmentStatus;
  priority:    AssignmentPriority;
  instructor:  string | { _id: string; username: string };
};

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
};

export const getAssignments = async (params?: { course?: string; status?: string }): Promise<Assignment[]> => {
  const qs = new URLSearchParams();
  if (params?.course) qs.set("course", params.course);
  if (params?.status) qs.set("status", params.status);
  return handle<Assignment[]>(await apiFetch(`/api/assignments${qs.toString() ? "?" + qs : ""}`));
};

export const getAssignmentById = async (id: string) =>
  handle<Assignment>(await apiFetch(`/api/assignments/${id}`));

export const createAssignment = async (data: {
  title: string; description?: string; course?: string; dueDate: string; maxMarks?: number;
}) => handle<Assignment>(await apiFetch("/api/assignments", { method: "POST", body: JSON.stringify(data) }));

export const updateAssignmentStatus = async (id: string, data: Partial<Assignment>) =>
  handle<Assignment>(await apiFetch(`/api/assignments/${id}`, { method: "PUT", body: JSON.stringify(data) }));

export const deleteAssignment = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/assignments/${id}`, { method: "DELETE" });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || "Delete failed"); }
};