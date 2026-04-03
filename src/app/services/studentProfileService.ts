import { getAuthHeader } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API          = `${API_BASE_URL}/api/student-profiles`;

/* ── Types ─────────────────────────────────────────────────── */
export type Address = {
  street:  string;
  city:    string;
  state:   string;
  pinCode: string;
  country: string;
};

export type Guardian = {
  name:         string;
  occupation:   string;
  phone:        string;
  email:        string;
  annualIncome?: number;
};

export type StudentProfile = {
  _id:              string;
  userId:           { _id: string; username: string; email: string } | string;

  // Personal
  fullName:          string;
  enrollmentNumber:  string | null;
  dateOfBirth:       string | null;
  gender:            string;
  bloodGroup:        string;
  nationality:       string;
  religion:          string;
  category:          string;
  photoUrl:          string;
  phone:             string;

  // Address
  permanentAddress:      Address;
  correspondenceAddress: Address & { sameAsPermanent: boolean };

  // Guardian
  father:        Guardian;
  mother:        Omit<Guardian, "annualIncome">;
  localGuardian: { name: string; relation: string; phone: string; address: string };

  // Academic
  department:            { _id: string; name: string; code: string } | null;
  academicYear:          { _id: string; label: string } | null;
  currentSemesterId:     string | null;
  currentSemesterNumber: number | null;
  admissionYear:         number | null;
  admissionType:         string;
  rollNumber:            string;
  division:              string;
  batch:                 string;

  // Previous education
  previousEducation: {
    institution:  string;
    board:        string;
    percentage:   number;
    passingYear:  number | null;
  };

  // Status
  isProfileComplete:  boolean;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationNote:   string;
  createdAt:          string;
  updatedAt:          string;
};

export type ProfilesResponse = {
  profiles: StudentProfile[];
  total:    number;
  page:     number;
  pages:    number;
};

/* ── Helpers ─────────────────────────────────────────────── */
const handle = async <T>(res: Response): Promise<T> => {
  let data: Record<string, unknown>;
  try { data = await res.json(); }
  catch { throw new Error(`Server error (${res.status})`); }
  if (!res.ok) throw new Error((data.error as string) || `Request failed (${res.status})`);
  return data as T;
};

/* ── Student: own profile ───────────────────────────────── */
export const getMyProfile = async (): Promise<StudentProfile> => {
  const res = await fetch(`${API}/me`, { headers: getAuthHeader() });
  return handle<StudentProfile>(res);
};

export const updateMyProfile = async (
  data: Partial<StudentProfile>
): Promise<StudentProfile> => {
  const res = await fetch(`${API}/me`, {
    method:  "PUT",
    headers: getAuthHeader(),
    body:    JSON.stringify(data),
  });
  return handle<StudentProfile>(res);
};

/* ── Admin / Instructor: view a student ─────────────────── */
export const getProfileByUserId = async (
  userId: string
): Promise<StudentProfile> => {
  const res = await fetch(`${API}/user/${userId}`, { headers: getAuthHeader() });
  return handle<StudentProfile>(res);
};

/* ── Admin: list all profiles ────────────────────────────── */
export const getAllProfiles = async (params?: {
  page?:       number;
  limit?:      number;
  department?: string;
  semester?:   number;
  status?:     string;
  division?:   string;
}): Promise<ProfilesResponse> => {
  const qs = new URLSearchParams();
  if (params?.page)       qs.set("page",       String(params.page));
  if (params?.limit)      qs.set("limit",      String(params.limit));
  if (params?.department) qs.set("department", params.department);
  if (params?.semester)   qs.set("semester",   String(params.semester));
  if (params?.status)     qs.set("status",     params.status);
  if (params?.division)   qs.set("division",   params.division);

  const url = `${API}${qs.toString() ? "?" + qs : ""}`;
  const res = await fetch(url, { headers: getAuthHeader() });
  return handle<ProfilesResponse>(res);
};

/* ── Admin: verify profile ───────────────────────────────── */
export const verifyProfile = async (
  userId: string,
  status: "verified" | "rejected" | "pending",
  note?:  string
): Promise<StudentProfile> => {
  const res = await fetch(`${API}/user/${userId}/verify`, {
    method:  "PATCH",
    headers: getAuthHeader(),
    body:    JSON.stringify({ status, note }),
  });
  return handle<StudentProfile>(res);
};

/* ── Admin: update a student's profile ──────────────────── */
export const adminUpdateProfile = async (
  userId: string,
  data:   Partial<StudentProfile>
): Promise<StudentProfile> => {
  const res = await fetch(`${API}/user/${userId}`, {
    method:  "PUT",
    headers: getAuthHeader(),
    body:    JSON.stringify(data),
  });
  return handle<StudentProfile>(res);
};
