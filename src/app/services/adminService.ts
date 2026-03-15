import { getAuthHeader } from "./authService";

/* =====================================================
API BASE
===================================================== */

const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ADMIN_API = `${API_BASE_URL}/api/admin`;
const SUBMISSION_API = `${API_BASE_URL}/api/submissions`;

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
===================================================== */

export const getDashboardData = async () => {

const res = await fetch(`${ADMIN_API}/dashboard`, {
method: "GET",
headers: getAuthHeader(),
});

return handleResponse(res);

};

/* =====================================================
ADMIN ANALYTICS
===================================================== */

export const getAnalyticsData = async () => {

const res = await fetch(`${ADMIN_API}/analytics`, {
method: "GET",
headers: getAuthHeader(),
});

return handleResponse(res);

};

/* =====================================================
ADMIN STATS
===================================================== */

export const getAdminStats = async () => {

const res = await fetch(`${ADMIN_API}/stats`, {
method: "GET",
headers: getAuthHeader(),
});

return handleResponse(res);

};

/* =====================================================
FEES STATS
===================================================== */

export const getFeesStats = async () => {

const res = await fetch(`${ADMIN_API}/fees`, {
method: "GET",
headers: getAuthHeader(),
});

return handleResponse(res);

};

/* =====================================================
ADMIN SUBMISSIONS
===================================================== */

export const getSubmissions = async () => {

const res = await fetch(`${SUBMISSION_API}`, {
method: "GET",
headers: getAuthHeader(),
});

return handleResponse(res);

};

/* =====================================================
GET ADMIN SETTINGS
===================================================== */

export const getSettings = async () => {

const res = await fetch(`${ADMIN_API}/settings`, {
method: "GET",
headers: getAuthHeader(),
});

return handleResponse(res);

};

/* =====================================================
SAVE ADMIN SETTINGS
===================================================== */

export type AdminSettings = {
general: any;
notifications: any;
security: any;
localization: any;
emailConfig: any;
backup: any;
};

export const saveSettings = async (settings: AdminSettings) => {

const res = await fetch(`${ADMIN_API}/settings`, {
method: "POST",
headers: getAuthHeader(),
body: JSON.stringify(settings),
});

return handleResponse(res);

};
