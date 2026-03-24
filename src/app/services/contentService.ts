import { getAuthHeader, getAuthHeaderNoContentType } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API          = `${API_BASE_URL}/api/content`;

export type ContentType = "pdf" | "video" | "image" | "document" | "other";

export type Content = {
  _id:        string;
  title:      string;
  type:       ContentType;
  url:        string;
  course:     string;
  uploadedBy: string;
  createdAt:  string;
};

const handle = async <T>(res: Response): Promise<T> => {
  let data: Record<string, unknown>;
  try { data = await res.json(); } catch { throw new Error(`Server error (${res.status})`); }
  if (!res.ok) throw new Error((data.error as string) || `Request failed (${res.status})`);
  return data as T;
};

/* ─── GET ALL CONTENT ────────────────────────────────────── */
export const getContent = async (): Promise<Content[]> => {
  const res = await fetch(`${API}?limit=100`, { headers: getAuthHeader() });
  const data = await handle<Content[] | { content: Content[] }>(res);
  return Array.isArray(data) ? data : (data as any).content ?? [];
};

/* ─── GET CONTENT FOR A COURSE ───────────────────────────── */
export const getCourseContents = async (courseId: string): Promise<Content[]> => {
  const res = await fetch(`${API}/course/${courseId}`, { headers: getAuthHeader() });
  const data = await handle<Content[] | { content: Content[] }>(res);
  return Array.isArray(data) ? data : (data as any).content ?? [];
};

/* ─── GET SINGLE ─────────────────────────────────────────── */
export const getContentById = async (id: string): Promise<Content> => {
  const res = await fetch(`${API}/${id}`, { headers: getAuthHeader() });
  return handle<Content>(res);
};

/* ─── UPLOAD CONTENT ─────────────────────────────────────── */
export const uploadContent = async (data: {
  title:    string;
  course?:  string;
  file:     File;
}): Promise<Content> => {
  const form = new FormData();
  form.append("title",  data.title);
  form.append("file",   data.file);
  if (data.course) form.append("course", data.course);

  const res = await fetch(API, {
    method:  "POST",
    headers: getAuthHeaderNoContentType(),
    body:    form,
  });
  return handle<Content>(res);
};

/* ─── DELETE CONTENT ─────────────────────────────────────── */
export const deleteContent = async (id: string): Promise<void> => {
  const res = await fetch(`${API}/${id}`, {
    method:  "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).error || "Delete failed");
  }
};
