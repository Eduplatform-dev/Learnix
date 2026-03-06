// src/app/services/contentService.ts

export type ContentType = "video" | "pdf" | "image";

export type Content = {
  _id: string;
  title: string;
  type: ContentType;
  url: string;
  course?: string; // ✅ link to course
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/content`;

/* ================= AUTH HEADER ================= */
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ================= GET ALL CONTENT ================= */
export const getContents = async (): Promise<Content[]> => {
  const res = await fetch(API, { headers: getAuthHeader() });

  if (!res.ok) throw new Error("Fetch failed");

  return res.json();
};

/* ================= ⭐ GET COURSE CONTENTS (FIX) ================= */
export const getCourseContents = async (
  courseId: string
): Promise<Content[]> => {
  const res = await fetch(`${API}/course/${courseId}`, {
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch course contents");
  }

  return res.json();
};

/* ================= CREATE CONTENT ================= */
export const createContent = async (formData: FormData) => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();
};

/* ================= UPDATE CONTENT ================= */
export const updateContent = async (
  id: string,
  data: { title?: string }
) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Update failed");

  return res.json();
};

/* ================= DELETE CONTENT ================= */
export const deleteContent = async (id: string) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  if (!res.ok) throw new Error("Delete failed");

  return true;
};
