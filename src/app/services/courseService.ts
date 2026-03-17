// src/app/services/courseService.ts

import { getAuthHeader } from "./authService";

export type CourseStatus = "In Progress" | "Completed" | "Not Started";

export type Course = {
  _id: string;
  title: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  status: CourseStatus;
  image: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/courses`;

export const getCourses = async (): Promise<Course[]> => {
  const res = await fetch(API, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
};

export const createCourse = async (data: {
  title: string;
  instructor: string;
  duration: string;
}): Promise<Course> => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
};

export const updateCourse = async (
  id: string,
  data: Partial<Course>
): Promise<Course> => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

export const deleteCourse = async (id: string): Promise<void> => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Delete failed");
};
