export type UserRole = "student" | "admin" | "instructor";

export type User = {
  _id:      string;
  id:       string;
  email:    string;
  username: string;
  role:     UserRole;
};

export type AuthResponse = {
  user:        User;
  accessToken: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* ─────────────────────────────────────────────────────────
   IN-MEMORY ACCESS TOKEN STORE
   ───────────────────────────────────────────────────────── */
let _accessToken: string | null = null;
let _currentUser: User | null   = null;

export const getToken       = (): string | null => _accessToken;
export const getCurrentUser = (): User | null   => _currentUser;

export const setMemoryAuth = (token: string, user: User): void => {
  _accessToken  = token;
  _currentUser  = user;
  localStorage.setItem("user_meta", JSON.stringify(user));
};

export const clearMemoryAuth = (): void => {
  _accessToken = null;
  _currentUser = null;
  localStorage.removeItem("user_meta");
};

export const getStoredUserMeta = (): User | null => {
  try {
    // FIX: try both 'user_meta' (new) and 'user' (legacy) keys
    const raw = localStorage.getItem("user_meta") || localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

/* ─────────────────────────────────────────────────────────
   AUTH HEADER HELPERS
   FIX: fall back to localStorage "token" for components
   that call fetch directly before silentRefresh completes.
   ───────────────────────────────────────────────────────── */
export const getAuthHeader = (): Record<string, string> => {
  const token = _accessToken || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getAuthHeaderNoContentType = (): Record<string, string> => {
  const token = _accessToken || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ─────────────────────────────────────────────────────────
   RESPONSE HANDLER
   ───────────────────────────────────────────────────────── */
const handleAuthResponse = async (res: Response): Promise<AuthResponse> => {
  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status})`);
  }
  if (!res.ok) {
    throw new Error((data.error as string) || `Request failed (${res.status})`);
  }
  const token = data.accessToken as string;
  const user  = data.user as User;
  setMemoryAuth(token, user);
  // Keep legacy keys in sync for forms/components that read localStorage directly
  localStorage.setItem("user",  JSON.stringify(user));
  localStorage.setItem("token", token);
  return { accessToken: token, user };
};

/* ─────────────────────────────────────────────────────────
   PUBLIC API
   ───────────────────────────────────────────────────────── */

export const registerUser = async (
  email: string, password: string, username: string, role: UserRole = "student",
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify({ email, password, username, role }),
  });
  return handleAuthResponse(res);
};

export const loginUser = async (
  email: string, password: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify({ email, password }),
  });
  return handleAuthResponse(res);
};

export const loginWithEnrollment = async (
  enrollmentNumber: string, password: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method:      "POST",
    headers:     { "Content-Type": "application/json" },
    credentials: "include",
    body:        JSON.stringify({ enrollmentNumber, password }),
  });
  return handleAuthResponse(res);
};

export const silentRefresh = async (): Promise<AuthResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method:      "POST",
      credentials: "include",
    });
    if (!res.ok) {
      clearMemoryAuth();
      return null;
    }
    return handleAuthResponse(res);
  } catch {
    clearMemoryAuth();
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const token = _accessToken || localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method:      "POST",
      headers:     token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
  } catch {
    // Even on network failure, clear local state
  } finally {
    clearMemoryAuth();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};

export const logoutAllDevices = async (): Promise<void> => {
  try {
    const token = _accessToken || localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
      method:      "POST",
      headers:     token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
  } catch {
    // Ignore
  } finally {
    clearMemoryAuth();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};