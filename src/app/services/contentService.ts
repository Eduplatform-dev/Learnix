// src/app/services/contentService.ts

import { getAuthHeader, getAuthHeaderNoContentType } from "./authService";

export type ContentType = "video" | "pdf" | "image";

export type Content = {
  _id: string;
  title: string;
  type: ContentType;
  url: string;
  course?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/content`;

/* GET ALL */
export const getContents = async (): Promise<Content[]> => {
  const res = await fetch(API, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
};

/* GET BY COURSE */
export const getCourseContents = async (
  courseId: string
): Promise<Content[]> => {
  const res = await fetch(`${API}/course/${courseId}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch course contents");
  return res.json();
};

/* CREATE (FormData — no Content-Type header, browser sets multipart boundary) */
export const createContent = async (formData: FormData): Promise<Content> => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeaderNoContentType(), // must NOT set Content-Type for FormData
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
};

/* UPDATE */
export const updateContent = async (
  id: string,
  data: { title?: string }
): Promise<Content> => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

/* DELETE */
export const deleteContent = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return true;
};
