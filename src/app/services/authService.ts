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

export const getToken = (): string | null =>
  localStorage.getItem("token");

/**
 * Returns auth headers WITHOUT throwing.
 * If no token exists the Authorization value is an empty string,
 * which the server will reject with 401 — that is handled per-call.
 * This prevents unhandled exceptions from crashing components on mount.
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Same as getAuthHeader but WITHOUT Content-Type.
 * Use this when sending FormData (browser sets multipart boundary automatically).
 */
export const getAuthHeaderNoContentType = (): Record<string, string> => {
  const token = getToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/* ================= HANDLE RESPONSE ================= */

const handleAuthResponse = async (res: Response): Promise<AuthResponse> => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  if (data.token && data.user) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return { user: data.user, token: data.token };
};

/* ================= REGISTER ================= */

export const registerUser = async (
  email: string,
  password: string,
  username: string,
  role: UserRole = "student"
): Promise<AuthResponse> => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username, role }),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
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
