import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  silentRefresh,
  logoutUser,
  setMemoryAuth,
  clearMemoryAuth,
  getStoredUserMeta,
  getToken,
  type User,
} from "../services/authService";

export type { UserRole } from "../services/authService";
export type { User } from "../services/authService";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setAuthUser: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Client-side JWT expiry check */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now() + 10_000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUserMeta);
  const [loading, setLoading] = useState(true);
  const originalFetchRef = useRef<typeof fetch | null>(null);

  /* ─── LOGOUT ─────────────────────────── */
  const logout = useCallback(async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  /* ─── RESTORE SESSION ────────────────── */
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const result = await silentRefresh();

      if (cancelled) return;

      if (result) {
        setUser(result.user);
      } else {
        clearMemoryAuth();
        setUser(null);
      }

      setLoading(false);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── GLOBAL 401 INTERCEPTOR + TOKEN ATTACH ───────────────── */
  useEffect(() => {
    originalFetchRef.current = window.fetch.bind(window);

    const intercepted: typeof fetch = async (input, init = {}) => {
      const storedToken = localStorage.getItem("token");

      // ✅ Attach token WITHOUT changing logic
      const updatedInit = {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
      };

      const response = await originalFetchRef.current!(input, updatedInit);

      if (response.status === 401) {
        const url = input?.toString() ?? "";
        const isApiCall = url.includes("/api/");
        if (isApiCall) {
          setUser((currentUser) => {
            if (currentUser) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              return null;
            }
            return currentUser;
          });
        }
      }
      return response;
    };

    window.fetch = intercepted;

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, []);

  /* ─── SET AUTH USER ──────────────────────────────────── */
  const setAuthUser = useCallback((user: User, token: string) => {
    localStorage.setItem("user",  JSON.stringify(user));
    localStorage.setItem("token", token);
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/* ── HELPER ───────────────── */
function injectToken(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}