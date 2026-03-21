import { getAuthHeader } from "./authService";

export type CourseStatus = "In Progress" | "Completed" | "Not Started" | "active" | "archived";

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
  enrolledStudents?: string[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/courses`;

export const getCourses = async (): Promise<Course[]> => {
  const res = await fetch(`${API}?limit=100`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Fetch failed");
  const data = await res.json();
  // Handle both paginated { courses: [...] } and plain array responses
  const raw: any[] = Array.isArray(data) ? data : (data.courses ?? []);
  return raw.map((c: any) => ({
    _id: c._id,
    title: c.title || "",
    instructor: c.instructor?.username || c.instructor || "",
    duration: c.duration || "",
    students: c.enrolledStudents?.length ?? c.students ?? 0,
    rating: c.rating ?? 4.5,
    progress: c.progress ?? 0,
    status: c.status || "active",
    image: c.image || "",
  }));
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
