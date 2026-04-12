/**
 * apiFetch.ts  —  src/app/lib/apiFetch.ts
 *
 * Thin wrapper around fetch that:
 *   1. Prepends the API base URL
 *   2. Attaches the access token (from memory via authService, falling back to localStorage)
 *   3. Sets Content-Type: application/json unless the body is FormData
 *   4. Sends cookies (credentials: "include") so the httpOnly refresh-token cookie travels
 */

import { getToken } from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  // Resolve the access token — prefer in-memory, fall back to localStorage
  // (localStorage fallback covers the narrow window before silentRefresh completes)
  const token = getToken() || localStorage.getItem("token");

  const isFormData = init.body instanceof FormData;

  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Don't set Content-Type for FormData — the browser needs to set the boundary
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
}