// src/app/services/adminService.ts

import { getAuthHeader } from "./authService";

/* =====================================================
   API BASE
===================================================== */

const API = "http://localhost:5000/api/admin";

/* =====================================================
   HELPER
===================================================== */

const handleResponse = async (res: Response) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

/* =====================================================
   ADMIN DASHBOARD
   GET /api/admin/dashboard
===================================================== */

export const getDashboardData = async () => {
  const res = await fetch(`${API}/dashboard`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};

/* =====================================================
   ADMIN ANALYTICS
   GET /api/admin/analytics
===================================================== */

export const getAnalyticsData = async () => {
  const res = await fetch(`${API}/analytics`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};

/* =====================================================
   ADMIN STATS
   GET /api/admin/stats
===================================================== */

export const getAdminStats = async () => {
  const res = await fetch(`${API}/stats`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};

/* =====================================================
   FEES STATS
   GET /api/admin/fees
===================================================== */

export const getFeesStats = async () => {
  const res = await fetch(`${API}/fees`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};

/* =====================================================
   GET ADMIN SETTINGS
   GET /api/admin/settings
===================================================== */

export const getSettings = async () => {
  const res = await fetch(`${API}/settings`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  return handleResponse(res);
};

/* =====================================================
   SAVE ADMIN SETTINGS
   POST /api/admin/settings
===================================================== */

export const saveSettings = async (settings: any) => {
  const res = await fetch(`${API}/settings`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(settings),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to save settings");
  }

  return data;
};