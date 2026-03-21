import { getAuthHeader } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = `${API_BASE_URL}/api/fees`;

export type FeeStatus = "paid" | "pending" | "overdue";
export type FeeCategory = "tuition" | "lab" | "technology" | "certification" | "other";

export type Fee = {
  _id: string;
  description: string;
  amount: number;
  status: FeeStatus;
  dueDate: string;
  paidAt: string | null;
  invoice: string;
  semester: string;
  category: FeeCategory;
  createdAt: string;
};

export type MyFeesResponse = {
  fees: Fee[];
  totalPaid: number;
  totalPending: number;
  nextFee: Fee | null;
};

const handle = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
};

export const getMyFees = async (): Promise<MyFeesResponse> => {
  const res = await fetch(`${API}/my`, { headers: getAuthHeader() });
  return handle<MyFeesResponse>(res);
};

export const markFeePaid = async (id: string): Promise<Fee> => {
  const res = await fetch(`${API}/${id}/pay`, {
    method: "PATCH",
    headers: getAuthHeader(),
  });
  return handle<Fee>(res);
};

export const getAllFees = async () => {
  const res = await fetch(API, { headers: getAuthHeader() });
  return handle<{ fees: Fee[]; totalRevenue: number; pendingPayments: number }>(res);
};
