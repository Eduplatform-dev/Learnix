import { apiFetch } from "../lib/apiFetch";

export type ContentType = "pdf" | "video" | "image" | "document" | "other";

export type Content = {
  _id: string; title: string; type: ContentType;
  url: string; course: string; uploadedBy: string; createdAt: string;
};

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
};

export const getContent = async (): Promise<Content[]> => {
  const data = await handle<Content[] | { content: Content[] }>(await apiFetch("/api/content?limit=100"));
  return Array.isArray(data) ? data : (data as any).content ?? [];
};

export const getContents = getContent;

export const getCourseContents = async (courseId: string): Promise<Content[]> => {
  const data = await handle<Content[] | { content: Content[] }>(await apiFetch(`/api/content/course/${courseId}`));
  return Array.isArray(data) ? data : (data as any).content ?? [];
};

export const getContentById = async (id: string) =>
  handle<Content>(await apiFetch(`/api/content/${id}`));

export const createContent = async (data: FormData | { title: string; course?: string; file: File }): Promise<Content> => {
  let form: FormData;
  if (data instanceof FormData) {
    form = data;
  } else {
    form = new FormData();
    form.append("title", data.title);
    form.append("file",  data.file);
    if (data.course) form.append("course", data.course);
  }
  return handle<Content>(await apiFetch("/api/content", { method: "POST", body: form }));
};

export const uploadContent = createContent;

export const updateContent = async (id: string, data: Partial<Pick<Content, "title" | "course">>) =>
  handle<Content>(await apiFetch(`/api/content/${id}`, { method: "PUT", body: JSON.stringify(data) }));

export const deleteContent = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/content/${id}`, { method: "DELETE" });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || "Delete failed"); }
};