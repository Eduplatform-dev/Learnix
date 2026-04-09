import { apiFetch } from "../lib/apiFetch";

export type DashboardData = {
  stats: { students: number; courses: number; revenue: number; completionRate: number };
  enrollmentData: { month: string; students: number }[];
};

export type AnalyticsData = {
  monthlyGrowth:   { month: string; users: number }[];
  userEngagement:  { day: string; active: number }[];
  courseRatings:   { name: string; rating: number; students: number }[];
  completionRates: { name: string; value: number }[];
  trafficSources:  { source: string; visits: number }[];
  kpiMetrics:      { label: string; value: number }[];
  counts?: { students: number; instructors: number; totalUsers: number; courses: number; submissions: number };
};

export type Settings = {
  general:       { platformName: string; supportEmail: string; logoUrl: string };
  notifications: { emailUpdates: boolean; productUpdates: boolean; billingAlerts: boolean };
  security:      { enforceTwoFactor: boolean; allowGoogleLogin: boolean; sessionTimeout: string };
  localization:  { language: string; timezone: string; dateFormat: string };
  emailConfig:   { smtpHost: string; smtpPort: string; smtpUser: string; fromName: string; fromEmail: string; footer: string };
  backup:        { autoBackup: boolean; retentionDays: string; backupWindow: string };
};

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
};

export const getDashboardData  = async () => handle<DashboardData>(await apiFetch("/api/admin/dashboard"));
export const getAnalyticsData  = async () => handle<AnalyticsData>(await apiFetch("/api/admin/analytics"));
export const getAdminStats     = async () => handle<Record<string, number>>(await apiFetch("/api/admin/stats"));
export const getFeesStats      = async () =>
  handle<{ totalRevenue: number; pendingPayments: number; paidStudents: number; growthRate: number }>(
    await apiFetch("/api/admin/fees-stats")
  );
export const getSettings       = async () => handle<Settings>(await apiFetch("/api/admin/settings"));
export const saveSettings      = async (data: Settings) =>
  handle<Settings>(await apiFetch("/api/admin/settings", { method: "POST", body: JSON.stringify(data) }));