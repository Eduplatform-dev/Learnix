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
   The access token is kept only in this module-level variable.
   It is never written to localStorage or sessionStorage, which
   eliminates the XSS read vector for the short-lived token.
   ───────────────────────────────────────────────────────── */
let _accessToken: string | null = null;
let _currentUser: User | null   = null;

export const getToken       = (): string | null => _accessToken;
export const getCurrentUser = (): User | null   => _currentUser;

export const setMemoryAuth = (token: string, user: User): void => {
  _accessToken  = token;
  _currentUser  = user;
  // Store only non-sensitive user metadata in localStorage so the UI can
  // repopulate before the silent-refresh completes (avoids flash of logged-out state).
  localStorage.setItem("user_meta", JSON.stringify(user));
};

export const clearMemoryAuth = (): void => {
  _accessToken = null;
  _currentUser = null;
  localStorage.removeItem("user_meta");
};

/** Returns the last-known user from localStorage (used on initial render only) */
export const getStoredUserMeta = (): User | null => {
  try {
    const raw = localStorage.getItem("user_meta");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

/* ─────────────────────────────────────────────────────────
   AUTH HEADER HELPERS
   ───────────────────────────────────────────────────────── */
export const getAuthHeader = (): Record<string, string> => {
  const token = _accessToken;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getAuthHeaderNoContentType = (): Record<string, string> => {
  const token = _accessToken;
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
    credentials: "include",   // send/receive httpOnly cookies
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

/**
 * Exchange the httpOnly refresh-token cookie for a new access token.
 * Called on app mount and transparently by the fetch interceptor.
 * Returns null if there is no valid session (user is logged out).
 */
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

/**
 * Revokes the current session's refresh token (server-side) and clears
 * the in-memory access token.  The httpOnly cookie is cleared by the server.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method:      "POST",
      headers:     getAuthHeader(),
      credentials: "include",
    });
  } catch {
    // Even if the network call fails, clear the in-memory state
  } finally {
    clearMemoryAuth();
  }
};

/**
 * Revokes ALL sessions for the current user across all devices.
 */
export const logoutAllDevices = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
      method:      "POST",
      headers:     getAuthHeader(),
      credentials: "include",
    });
  } catch {
    // Ignore network errors — still clear local state
  } finally {
    clearMemoryAuth();
  }
};