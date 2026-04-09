/**
 * apiFetch
 *
 * Drop-in replacement for `fetch` for all API calls.
 *
 * What it does:
 *  1. Always sends `credentials: "include"` so the browser attaches the
 *     httpOnly access_token cookie automatically.
 *  2. On a 401 response it attempts a single silent refresh via
 *     POST /api/auth/refresh (which rotates the refresh-token cookie and
 *     issues a new access_token cookie server-side).
 *  3. If refresh succeeds the original request is retried once.
 *  4. If refresh fails (expired / revoked) it dispatches a global
 *     "auth:logout" event so AuthProvider can clear React state and
 *     redirect to /login.
 *
 * No tokens are ever stored in localStorage or JS-accessible memory.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let isRefreshing = false;
// Queue of { resolve, reject } for requests that arrived while a refresh is in flight
let refreshQueue: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

function drainQueue(err?: Error) {
  refreshQueue.forEach(p => (err ? p.reject(err) : p.resolve()));
  refreshQueue = [];
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method:      "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch(
  input: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  const url =
    typeof input === "string" && input.startsWith("/")
      ? `${API_BASE_URL}${input}`
      : String(input);

  const opts: RequestInit = {
    ...init,
    credentials: "include", // always send cookies
    headers: {
      // Only set Content-Type for JSON bodies; let multipart set its own
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  };

  let response = await fetch(url, opts);

  // Not a 401 — return as-is
  if (response.status !== 401) return response;

  // Already refreshing — queue this request and wait
  if (isRefreshing) {
    await new Promise<void>((resolve, reject) =>
      refreshQueue.push({ resolve, reject })
    );
    // Retry after the refresh completed
    return fetch(url, opts);
  }

  // We are the first to hit 401 — attempt refresh
  isRefreshing = true;
  const refreshed = await attemptRefresh();
  isRefreshing = false;

  if (refreshed) {
    drainQueue(); // let queued requests proceed
    return fetch(url, opts); // retry original request
  }

  // Refresh failed — session is dead
  const err = new Error("Session expired");
  drainQueue(err);
  window.dispatchEvent(new CustomEvent("auth:logout"));
  return response; // return the original 401 so callers can react if needed
}

/** Convenience helpers that match the existing service signatures */
export function apiGet(path: string, init: RequestInit = {}) {
  return apiFetch(path, { method: "GET", ...init });
}

export function apiPost(path: string, body?: unknown, init: RequestInit = {}) {
  return apiFetch(path, {
    method: "POST",
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

export function apiPut(path: string, body?: unknown, init: RequestInit = {}) {
  return apiFetch(path, {
    method: "PUT",
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

export function apiPatch(path: string, body?: unknown, init: RequestInit = {}) {
  return apiFetch(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

export function apiDelete(path: string, init: RequestInit = {}) {
  return apiFetch(path, { method: "DELETE", ...init });
}
