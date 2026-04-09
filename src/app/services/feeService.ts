import { apiFetch } from "../lib/apiFetch";

export type FeeStatus   = "paid" | "pending" | "overdue";
export type FeeCategory = "tuition" | "lab" | "technology" | "certification" | "other";

export type Fee = {
  _id: string; description: string; amount: number; status: FeeStatus;
  dueDate: string; paidAt: string | null; invoice: string; semester: string;
  category: FeeCategory; createdAt: string;
};

export type MyFeesResponse   = { fees: Fee[]; totalPaid: number; totalPending: number; nextFee: Fee | null };
export type AllFeesResponse  = { fees: Fee[]; totalRevenue: number; pendingPayments: number; total: number; page: number };

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
};

export const getMyFees    = async () => handle<MyFeesResponse>(await apiFetch("/api/fees/my"));
export const markFeePaid  = async (id: string) =>
  handle<Fee>(await apiFetch(`/api/fees/${id}/pay`, { method: "PATCH" }));

export const getAllFees = async (params?: {
  page?: number; limit?: number; status?: FeeStatus; studentId?: string;
}): Promise<AllFeesResponse> => {
  const qs = new URLSearchParams();
  if (params?.page)      qs.set("page",      String(params.page));
  if (params?.limit)     qs.set("limit",     String(params.limit));
  if (params?.status)    qs.set("status",    params.status!);
  if (params?.studentId) qs.set("studentId", params.studentId);
  return handle<AllFeesResponse>(await apiFetch(`/api/fees${qs.toString() ? "?" + qs : ""}`));
};

export const createFee = async (data: {
  studentId: string; description: string; amount: number;
  dueDate: string; category?: FeeCategory; semester?: string;
}) => handle<Fee>(await apiFetch("/api/fees", { method: "POST", body: JSON.stringify(data) }));

export const deleteFeeRecord = async (id: string): Promise<void> => {
  const res = await apiFetch(`/api/fees/${id}`, { method: "DELETE" });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as any).error || "Delete failed"); }
};