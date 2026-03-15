import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ================= ROLES ================= */

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

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= RESTORE SESSION ================= */

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    try {

      if (storedUser && storedToken) {

        const parsedUser: User = JSON.parse(storedUser);

        setUser(parsedUser);
        setToken(storedToken);

      }

    } catch {

      console.warn("Invalid auth data found in localStorage");

      localStorage.removeItem("user");
      localStorage.removeItem("token");

    } finally {

      setLoading(false);

    }

  }, []);

  /* ================= LOGIN ================= */

  const setAuthUser = (user: User, token: string) => {

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    setUser(user);
    setToken(token);

  };

  /* ================= LOGOUT ================= */

  const logout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);

  };

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setAuthUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
}

/* ================= HOOK ================= */

export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;

}