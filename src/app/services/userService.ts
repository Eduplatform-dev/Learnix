// src/app/services/userService.ts

import { getAuthHeader } from "./authService";

export type UserRole = "student" | "admin" | "instructor";

export type AdminUser = {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/users`;

/* GET ALL */
export const getUsers = async (): Promise<AdminUser[]> => {
  const res = await fetch(API, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
};

/* CREATE */
export const createUserDoc = async (data: {
  email: string;
  password: string;
  username: string;
  role?: UserRole;
}): Promise<AdminUser> => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
};

/* UPDATE ROLE */
export const updateUserRole = async (
  id: string,
  role: UserRole
): Promise<AdminUser> => {
  const res = await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

/* DELETE */
export const deleteUser = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return true;
};
