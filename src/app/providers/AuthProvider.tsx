// src/app/providers/AuthProvider.tsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "student" | "admin" | "instructor";

export type User = {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuthUser: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Decode a JWT payload without verifying signature (client-side only check) */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // malformed token → treat as expired
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOGOUT ================= */
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  /* ================= RESTORE SESSION ================= */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        if (isTokenExpired(storedToken)) {
          // Token expired — clear and force re-login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= GLOBAL 401 INTERCEPTOR ================= */
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        // Clone so the original response body can still be read by caller
        const cloned = response.clone();
        // Only auto-logout if we currently think we're logged in
        setUser((currentUser) => {
          if (currentUser) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
          }
          return currentUser;
        });
        setToken(null);
        return cloned;
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  /* ================= LOGIN ================= */
  const setAuthUser = useCallback((user: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setUser(user);
    setToken(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
