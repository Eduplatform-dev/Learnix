// src/app/services/assignmentService.ts

export type AssignmentStatus = "Not Started" | "In Progress" | "Submitted";
export type AssignmentPriority = "high" | "medium" | "low";
export type AssignmentType = "Project" | "Quiz" | "Lab";

export type Assignment = {
  _id: string;
  title: string;
  course: string;
  dueDate: string;
  type: AssignmentType;
  status: AssignmentStatus;
  priority: AssignmentPriority;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/assignments`;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

/* GET */
export const getAssignments = async (): Promise<Assignment[]> => {
  const res = await fetch(API, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
};

/* CREATE */
export const createAssignment = async (
  data: Omit<Assignment, "_id">
) => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create assignment");
  return res.json();
};

/* UPDATE */
export const updateAssignmentStatus = async (
  id: string,
  data: Partial<Assignment>
) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
};

/* DELETE */
export const deleteAssignment = async (id: string) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Delete failed");
};
