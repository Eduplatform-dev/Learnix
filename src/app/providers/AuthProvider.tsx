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

  /* ── LOGOUT ───────────────── */
  const logout = useCallback(async () => {
    await logoutUser();
    clearMemoryAuth();
    setUser(null);
  }, []);

  /* ── INITIAL SILENT REFRESH ───────────────── */
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

  /* ── PROACTIVE REFRESH (every 13 min) ───────────────── */
  useEffect(() => {
    if (!user) return;

    const id = setInterval(async () => {
      const result = await silentRefresh();

      if (result) {
        setUser(result.user);
      } else {
        clearMemoryAuth();
        setUser(null);
      }
    }, 13 * 60 * 1000);

    return () => clearInterval(id);
  }, [user]);

  /* ── FETCH INTERCEPTOR (FIXED) ───────────────── */
  const originalFetchRef = useRef<typeof fetch | null>(null);

  useEffect(() => {
    originalFetchRef.current = window.fetch.bind(window);

    let isRefreshing = false;
    let waiters: Array<(token: string | null) => void> = [];

    const notifyWaiters = (token: string | null) => {
      waiters.forEach((cb) => cb(token));
      waiters = [];
    };

    const intercepted: typeof fetch = async (input, init) => {
      // ✅ ALWAYS attach token BEFORE request
      const token = getToken();
      const firstInit = token ? injectToken(init, token) : init;

      const response = await originalFetchRef.current!(input, firstInit);

      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url ?? "";

      // only handle API 401
      if (response.status !== 401 || !url.includes("/api/")) {
        return response;
      }

      // skip auth endpoints
      if (url.includes("/api/auth/")) return response;

      // if already refreshing → wait
      if (isRefreshing) {
        const newToken = await new Promise<string | null>((resolve) => {
          waiters.push(resolve);
        });

        if (!newToken) return response;

        const retryInit = injectToken(init, newToken);
        return originalFetchRef.current!(input, retryInit);
      }

      // start refresh
      isRefreshing = true;
      const result = await silentRefresh();
      isRefreshing = false;

      if (!result) {
        notifyWaiters(null);
        clearMemoryAuth();
        setUser(null);
        return response;
      }

      setUser(result.user);
      notifyWaiters(result.accessToken);

      // retry original request
      const retryInit = injectToken(init, result.accessToken);
      return originalFetchRef.current!(input, retryInit);
    };

    window.fetch = intercepted;

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, []);

  /* ── SET AUTH USER ───────────────── */
  const setAuthUser = useCallback(
    (user: User, accessToken: string) => {
      setMemoryAuth(accessToken, user);
      setUser(user);
    },
    []
  );

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