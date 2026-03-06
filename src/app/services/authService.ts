// src/app/services/authService.ts

export type UserRole = "student" | "admin" | "instructor";

export type User = {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
};

export type AuthResponse = {
  user: User;
  token: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/auth`;

/* ================= TOKEN ================= */

export const getToken = () => localStorage.getItem("token");

export const getAuthHeader = () => {
  const token = getToken();

  if (!token) {
    throw new Error("No token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* ================= HANDLE RESPONSE ================= */

const handleAuthResponse = async (
  res: Response
): Promise<AuthResponse> => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  if (data.token && data.user) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return {
    user: data.user,
    token: data.token,
  };
};

/* ================= REGISTER ================= */
/* ✅ role added (default = student) */

export const registerUser = async (
  email: string,
  password: string,
  username: string,
  role: UserRole = "student"
): Promise<AuthResponse> => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      username,
      role, // ✅ send role to backend
    }),
  });

  return handleAuthResponse(res);
};

/* ================= LOGIN ================= */

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return handleAuthResponse(res);
};

/* ================= CURRENT USER ================= */

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/* ================= LOGOUT ================= */

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
