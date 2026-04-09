import { apiFetch } from "../lib/apiFetch";

export type SubmissionStatus = "draft" | "submitted" | "graded";

export type Submission = {
  _id: string; assignmentId: string; assignmentTitle: string; course: string;
  studentId: string; studentName: string; title: string; description: string; text: string;
  files: { originalName: string; filename: string; url: string; size: number }[];
  grade: string | null; feedback: string; gradedAt: string | null;
  status: SubmissionStatus; createdAt: string; updatedAt: string;
};

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
};

export const getSubmissions = async (params?: {
  assignmentId?: string; status?: SubmissionStatus;
}): Promise<Submission[]> => {
  const qs = new URLSearchParams();
  if (params?.assignmentId) qs.set("assignmentId", params.assignmentId);
  if (params?.status)       qs.set("status",       params.status!);
  const data = await handle<Submission[] | { submissions: Submission[] }>(
    await apiFetch(`/api/submissions${qs.toString() ? "?" + qs : ""}`)
  );
  return Array.isArray(data) ? data : (data as any).submissions ?? [];
};

export const getSubmissionById = async (id: string) =>
  handle<Submission>(await apiFetch(`/api/submissions/${id}`));

export const createSubmission = async (
  data: FormData | { assignmentId: string; title?: string; description?: string; text?: string; files?: File[]; status?: SubmissionStatus }
): Promise<Submission> => {
  let formData: FormData;
  if (data instanceof FormData) {
    formData = data;
  } else {
    formData = new FormData();
    formData.append("assignmentId", data.assignmentId);
    if (data.title)       formData.append("title",       data.title);
    if (data.description) formData.append("description", data.description);
    if (data.text)        formData.append("text",        data.text);
    if (data.status)      formData.append("status",      data.status);
    data.files?.forEach(f => formData.append("files", f));
  }
  return handle<Submission>(await apiFetch("/api/submissions", { method: "POST", body: formData }));
};

export const gradeSubmission = async (id: string, data: { grade: string; feedback?: string }) =>
  handle<Submission>(await apiFetch(`/api/submissions/${id}/grade`, { method: "PATCH", body: JSON.stringify(data) }));

export const deleteSubmission = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/submissions/${id}`, { method: "DELETE" });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || "Delete failed"); }
};