// src/app/services/submissionService.ts

import { getAuthHeader, getAuthHeaderNoContentType } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/submissions`;

/* ─── TYPES ──────────────────────────────────────────── */
export type SubmissionStatus = "draft" | "submitted" | "graded";

export type SubmissionFile = {
  originalName: string;
  filename: string;
  url: string;
  size: number;
};

export type Submission = {
  _id: string;
  assignmentId: string;
  assignmentTitle: string;
  course: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  text: string;
  files: SubmissionFile[];
  grade: string | null;
  feedback: string;
  gradedAt: string | null;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
};

export type GradePayload = {
  grade: string;
  feedback?: string;
};

/* ─── HELPERS ────────────────────────────────────────── */
const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
};

/* ─── GET ALL (student sees own, admin sees all) ──────── */
export const getSubmissions = async (): Promise<Submission[]> => {
  const res = await fetch(API, { headers: getAuthHeader() });
  return handleResponse<Submission[]>(res);
};

/* ─── GET BY ASSIGNMENT ──────────────────────────────── */
export const getSubmissionsByAssignment = async (
  assignmentId: string
): Promise<Submission[]> => {
  const res = await fetch(`${API}/assignment/${assignmentId}`, {
    headers: getAuthHeader(),
  });
  return handleResponse<Submission[]>(res);
};

/* ─── GET SINGLE ─────────────────────────────────────── */
export const getSubmission = async (id: string): Promise<Submission> => {
  const res = await fetch(`${API}/${id}`, { headers: getAuthHeader() });
  return handleResponse<Submission>(res);
};

/* ─── CREATE (with optional file upload) ─────────────── */
export const createSubmission = async (
  formData: FormData
): Promise<Submission> => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeaderNoContentType(),
    body: formData,
  });
  return handleResponse<Submission>(res);
};

/* ─── UPDATE (with optional new files) ───────────────── */
export const updateSubmission = async (
  id: string,
  formData: FormData
): Promise<Submission> => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: getAuthHeaderNoContentType(),
    body: formData,
  });
  return handleResponse<Submission>(res);
};

/* ─── GRADE (admin/instructor) ───────────────────────── */
export const gradeSubmission = async (
  id: string,
  payload: GradePayload
): Promise<Submission> => {
  const res = await fetch(`${API}/${id}/grade`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Submission>(res);
};

/* ─── DELETE (admin) ─────────────────────────────────── */
export const deleteSubmission = async (id: string): Promise<void> => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Delete failed");
  }
};
