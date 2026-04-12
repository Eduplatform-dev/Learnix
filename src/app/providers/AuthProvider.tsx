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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUserMeta);
  const [loading, setLoading] = useState(true);
  const originalFetchRef = useRef<typeof fetch | null>(null);

  /* ─── LOGOUT ─────────────────────────────────────────── */
  // FIX: call logoutUser() so the server revokes the refresh-token cookie,
  // then clear both in-memory state AND the localStorage fallback keys.
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Never block logout on network error
    } finally {
      // Clear every storage location the app might have used
      clearMemoryAuth();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("user_meta");
      setUser(null);
    }
  }, []);

  /* ─── RESTORE SESSION ─────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const result = await silentRefresh();

      if (cancelled) return;

      if (result) {
        setUser(result.user);
        // Keep legacy localStorage keys in sync so components that read
        // them directly (e.g. onboarding forms) still work.
        localStorage.setItem("user",  JSON.stringify(result.user));
        localStorage.setItem("token", result.accessToken);
      } else {
        clearMemoryAuth();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }

      setLoading(false);
    };

    bootstrap();

    return () => { cancelled = true; };
  }, []);

  /* ─── GLOBAL 401 INTERCEPTOR + TOKEN ATTACH ──────────── */
  useEffect(() => {
    originalFetchRef.current = window.fetch.bind(window);

    const intercepted: typeof fetch = async (input, init = {}) => {
      // FIX: prefer in-memory token, fall back to localStorage so components
      // that call fetch directly (outside apiFetch) still get a token attached.
      const storedToken = getToken() || localStorage.getItem("token");

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
        // Don't trigger logout on auth endpoints themselves (avoid loop)
        const isAuthEndpoint = url.includes("/api/auth/");
        if (isApiCall && !isAuthEndpoint) {
          setUser((currentUser) => {
            if (currentUser) {
              clearMemoryAuth();
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("user_meta");
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

  /* ─── SET AUTH USER ───────────────────────────────────── */
  const setAuthUser = useCallback((user: User, token: string) => {
    setMemoryAuth(token, user);
    // Keep legacy localStorage keys in sync for components that read them directly
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