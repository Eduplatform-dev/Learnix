import { useEffect, useState, useCallback } from "react";
import {
  Users, GraduationCap, Shield, Search, BarChart2, X,
  ChevronRight, BookOpen, FileText, CheckCircle, Clock,
  TrendingUp, Award, AlertCircle, UserCheck, Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Progress } from "../../ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const PIE_COLORS   = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

type Role = "student" | "instructor" | "admin";

type UserRow = {
  _id:       string;
  username:  string;
  email:     string;
  role:      Role;
  createdAt: string;
};

type StudentProfile = {
  _id:              string;
  fullName:         string;
  enrollmentNumber: string | null;
  department:       { name: string; code: string } | null;
  year:             number | null;
  division:         string;
  rollNumber:       string;
  gender:           string;
  bloodGroup:       string;
  phoneNumber:      string;
  category:         string;
  photo:            string;
  parentName:       string;
  parentPhone:      string;
  isSubmitted:      boolean;
  admissionYear:    number | null;
};

type InstructorProfile = {
  _id:             string;
  fullName:        string;
  employeeId:      string;
  department:      { name: string; code: string } | null;
  designation:     string;
  qualification:   string;
  specialization:  string;
  experienceYears: number;
  gender:          string;
  bloodGroup:      string;
  phoneNumber:     string;
  photo:           string;
  joiningDate:     string;
  isSubmitted:     boolean;
};

type Analysis = {
  enrolledCourses:    number;
  completedCourses:   number;
  totalLessons:       number;
  completedLessons:   number;
  totalSubmissions:   number;
  gradedSubmissions:  number;
  averageGrade:       number | null;
  courseBreakdown:    { name: string; percent: number }[];
  submissionTrend:    { month: string; count: number }[];
  gradeDistribution:  { range: string; count: number }[];
  // instructor
  coursesCreated?:    number;
  totalStudentsTaught?: number;
  assignmentsCreated?:  number;
  pendingToGrade?:      number;
  gradedTotal?:         number;
  avgGradeGiven?:       number | null;
};

function authHeader() {
  const t = localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ══════════════════════════════════════════════════════
   STUDENT ANALYSIS MODAL
══════════════════════════════════════════════════════ */
function StudentAnalysisModal({
  user,
  profile,
  onClose,
}: {
  user: UserRow;
  profile: StudentProfile | null;
  onClose: () => void;
}) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch submissions for this student
        const [submissions, courses] = await Promise.all([
          apiFetch<any[]>(`/api/submissions?studentId=${user._id}&limit=200`).catch(() => []),
          apiFetch<any>(`/api/courses?limit=200`).catch(() => ({ courses: [] })),
        ]);

        const subs = Array.isArray(submissions) ? submissions : [];
        const allCourses = courses?.courses ?? [];

        const graded   = subs.filter((s: any) => s.status === "graded");
        const grades   = graded
          .map((s: any) => {
            const m = String(s.grade || "").match(/(\d+)\s*\/\s*(\d+)/);
            if (m) return Math.round((+m[1] / +m[2]) * 100);
            const n = parseFloat(s.grade);
            return isNaN(n) ? null : n;
          })
          .filter((g: number | null): g is number => g !== null);

        const avgGrade = grades.length
          ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length)
          : null;

        // Submission trend last 6 months
        const now    = new Date();
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const trend  = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const count = subs.filter((s: any) => {
            const c = new Date(s.createdAt);
            return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
          }).length;
          return { month: months[d.getMonth()], count };
        });

        // Grade distribution
        const gradeRanges = [
          { range: "90-100", min: 90, max: 100 },
          { range: "75-89",  min: 75, max: 89  },
          { range: "60-74",  min: 60, max: 74  },
          { range: "< 60",   min: 0,  max: 59  },
        ];
        const gradeDistribution = gradeRanges.map(({ range, min, max }) => ({
          range,
          count: grades.filter((g: number) => g >= min && g <= max).length,
        }));

        setAnalysis({
          enrolledCourses:   0,
          completedCourses:  0,
          totalLessons:      0,
          completedLessons:  0,
          totalSubmissions:  subs.length,
          gradedSubmissions: graded.length,
          averageGrade:      avgGrade,
          courseBreakdown:   [],
          submissionTrend:   trend,
          gradeDistribution,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{profile?.fullName || user.username}</h2>
              <p className="text-sm text-gray-500">Student Analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Submissions", value: analysis?.totalSubmissions ?? 0,  icon: FileText,    color: "text-indigo-600",  bg: "bg-indigo-50" },
                { label: "Graded",            value: analysis?.gradedSubmissions ?? 0, icon: CheckCircle, color: "text-green-600",   bg: "bg-green-50" },
                { label: "Pending",           value: (analysis?.totalSubmissions ?? 0) - (analysis?.gradedSubmissions ?? 0), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Avg Grade",         value: analysis?.averageGrade != null ? `${analysis.averageGrade}%` : "N/A", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.label}>
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                        <Icon className={`w-5 h-5 ${s.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Submission Trend */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Submission Activity (6 Months)</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.submissionTrend.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analysis.submissionTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="Submissions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No submissions yet</div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Grade Distribution</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.gradeDistribution.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={analysis.gradeDistribution.filter(d => d.count > 0)} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={80} label={(props: any) => `${props.range}: ${props.count}`}>
                          {analysis.gradeDistribution.filter(d => d.count > 0).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No graded submissions yet</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Info */}
            {profile && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Profile Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      ["Enrollment No.", profile.enrollmentNumber || "Not assigned"],
                      ["Department",     profile.department?.name || "—"],
                      ["Year",           profile.year ? `Year ${profile.year}` : "—"],
                      ["Division",       profile.division || "—"],
                      ["Roll No.",       profile.rollNumber || "—"],
                      ["Category",       profile.category?.toUpperCase() || "—"],
                      ["Blood Group",    profile.bloodGroup || "—"],
                      ["Phone",          profile.phoneNumber || "—"],
                      ["Parent",         profile.parentName || "—"],
                      ["Parent Phone",   profile.parentPhone || "—"],
                      ["Admission Year", profile.admissionYear?.toString() || "—"],
                      ["Email",          "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{k}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INSTRUCTOR ANALYSIS MODAL
══════════════════════════════════════════════════════ */
function InstructorAnalysisModal({
  user,
  profile,
  onClose,
}: {
  user: UserRow;
  profile: InstructorProfile | null;
  onClose: () => void;
}) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, submissionsRes] = await Promise.all([
          apiFetch<any>(`/api/courses?limit=200`).catch(() => ({ courses: [] })),
          apiFetch<any[]>(`/api/submissions?limit=500`).catch(() => []),
        ]);

        const allCourses = (coursesRes?.courses ?? []).filter(
          (c: any) => String(c.instructor?._id || c.instructor) === String(user._id)
        );
        const subs = Array.isArray(submissionsRes) ? submissionsRes : [];

        const totalStudents = new Set(
          allCourses.flatMap((c: any) => c.enrolledStudents || [])
        ).size;

        const graded = subs.filter((s: any) => s.status === "graded");
        const pending = subs.filter((s: any) => s.status === "submitted");

        const grades = graded
          .map((s: any) => {
            const m = String(s.grade || "").match(/(\d+)\s*\/\s*(\d+)/);
            if (m) return Math.round((+m[1] / +m[2]) * 100);
            const n = parseFloat(s.grade);
            return isNaN(n) ? null : n;
          })
          .filter((g: number | null): g is number => g !== null);

        const avgGradeGiven = grades.length
          ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length)
          : null;

        const now    = new Date();
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const trend  = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const count = graded.filter((s: any) => {
            const c = new Date(s.gradedAt || s.updatedAt);
            return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
          }).length;
          return { month: months[d.getMonth()], count };
        });

        setAnalysis({
          enrolledCourses:      0,
          completedCourses:     0,
          totalLessons:         0,
          completedLessons:     0,
          totalSubmissions:     subs.length,
          gradedSubmissions:    graded.length,
          averageGrade:         null,
          courseBreakdown:      allCourses.slice(0, 5).map((c: any) => ({
            name:    c.title.length > 18 ? c.title.slice(0, 16) + "…" : c.title,
            percent: c.enrolledStudents?.length ?? 0,
          })),
          submissionTrend:      trend,
          gradeDistribution:    [],
          coursesCreated:       allCourses.length,
          totalStudentsTaught:  totalStudents,
          pendingToGrade:       pending.length,
          gradedTotal:          graded.length,
          avgGradeGiven,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{profile?.fullName || user.username}</h2>
              <p className="text-sm text-gray-500">Instructor Analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Courses Created",   value: analysis?.coursesCreated ?? 0,     icon: BookOpen,    color: "text-indigo-600",  bg: "bg-indigo-50" },
                { label: "Students Taught",   value: analysis?.totalStudentsTaught ?? 0, icon: Users,       color: "text-blue-600",    bg: "bg-blue-50" },
                { label: "Graded",            value: analysis?.gradedTotal ?? 0,         icon: CheckCircle, color: "text-green-600",   bg: "bg-green-50" },
                { label: "Pending to Grade",  value: analysis?.pendingToGrade ?? 0,      icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.label}>
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                        <Icon className={`w-5 h-5 ${s.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grading activity trend */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Grading Activity (6 Months)</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.submissionTrend.some((d) => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analysis.submissionTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} name="Graded" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No grading activity yet</div>
                  )}
                </CardContent>
              </Card>

              {/* Students per course */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Students per Course</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.courseBreakdown && analysis.courseBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analysis.courseBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="percent" fill="#6366f1" radius={[0,4,4,0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No courses created yet</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Average grade given */}
            {analysis?.avgGradeGiven != null && (
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{analysis.avgGradeGiven}%</p>
                    <p className="text-sm text-gray-500">Average grade given to students</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Info */}
            {profile && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Profile Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      ["Employee ID",    profile.employeeId || "—"],
                      ["Department",     profile.department?.name || "—"],
                      ["Designation",    profile.designation || "—"],
                      ["Qualification",  profile.qualification || "—"],
                      ["Specialization", profile.specialization || "—"],
                      ["Experience",     profile.experienceYears ? `${profile.experienceYears} yrs` : "—"],
                      ["Blood Group",    profile.bloodGroup || "—"],
                      ["Phone",          profile.phoneNumber || "—"],
                      ["Joining Date",   profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{k}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROFILE DETAIL DRAWER
══════════════════════════════════════════════════════ */
function ProfileDrawer({
  user,
  profile,
  onClose,
}: {
  user: UserRow;
  profile: StudentProfile | InstructorProfile | null;
  onClose: () => void;
}) {
  const isStudent = user.role === "student";
  const sp = isStudent ? (profile as StudentProfile | null) : null;
  const ip = !isStudent ? (profile as InstructorProfile | null) : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-40">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {isStudent ? "Student" : "Instructor"} Profile
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className={`text-xl font-bold ${isStudent ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                {(profile as any)?.fullName?.slice(0, 2).toUpperCase() || user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-gray-900">{(profile as any)?.fullName || user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge className={`text-xs mt-1 ${isStudent ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                {user.role}
              </Badge>
            </div>
          </div>

          {!profile ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Profile not submitted yet</p>
            </div>
          ) : (
            <>
              {/* Student fields */}
              {isStudent && sp && (
                <div className="space-y-3">
                  {[
                    ["Enrollment No.", sp.enrollmentNumber || "Not assigned"],
                    ["Department",    sp.department?.name || "—"],
                    ["Year",          sp.year ? `Year ${sp.year}` : "—"],
                    ["Division",      sp.division || "—"],
                    ["Roll No.",      sp.rollNumber || "—"],
                    ["Gender",        sp.gender || "—"],
                    ["Blood Group",   sp.bloodGroup || "—"],
                    ["Category",      sp.category?.toUpperCase() || "—"],
                    ["Phone",         sp.phoneNumber || "—"],
                    ["Parent Name",   sp.parentName || "—"],
                    ["Parent Phone",  sp.parentPhone || "—"],
                    ["Admission Yr.", sp.admissionYear?.toString() || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">{k}</span>
                      <span className="text-sm font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Instructor fields */}
              {!isStudent && ip && (
                <div className="space-y-3">
                  {[
                    ["Employee ID",    ip.employeeId || "—"],
                    ["Department",    ip.department?.name || "—"],
                    ["Designation",   ip.designation || "—"],
                    ["Qualification", ip.qualification || "—"],
                    ["Specialization",ip.specialization || "—"],
                    ["Experience",    ip.experienceYears ? `${ip.experienceYears} yrs` : "—"],
                    ["Gender",        ip.gender || "—"],
                    ["Blood Group",   ip.bloodGroup || "—"],
                    ["Phone",         ip.phoneNumber || "—"],
                    ["Joining Date",  ip.joiningDate ? new Date(ip.joiningDate).toLocaleDateString() : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">{k}</span>
                      <span className="text-sm font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export function AdminUsers() {
  const [users,    setUsers]    = useState<UserRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, StudentProfile | InstructorProfile>>(new Map());
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [activeTab, setActiveTab] = useState<Role>("student");

  const [drawerUser,    setDrawerUser]    = useState<UserRow | null>(null);
  const [analysisUser,  setAnalysisUser]  = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<UserRow[]>("/api/users?limit=200");
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Load profiles for current tab when it changes
  useEffect(() => {
    const loadProfiles = async () => {
      if (activeTab === "admin") return;
      try {
        const endpoint = activeTab === "student"
          ? "/api/profiles/students?limit=200"
          : "/api/profiles/instructors";
        const res = await apiFetch<any>(endpoint);
        const list: any[] = activeTab === "student" ? (res.profiles ?? res) : res;

        const map = new Map<string, StudentProfile | InstructorProfile>();
        list.forEach((p: any) => {
          const userId = p.user?._id || p.user;
          if (userId) map.set(String(userId), p);
        });
        setProfiles(map);
      } catch {
        // profiles might not exist yet — that's fine
      }
    };
    loadProfiles();
  }, [activeTab]);

  const filtered = users.filter((u) => {
    const matchRole   = u.role === activeTab;
    const matchSearch = !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    student:    users.filter((u) => u.role === "student").length,
    instructor: users.filter((u) => u.role === "instructor").length,
    admin:      users.filter((u) => u.role === "admin").length,
  };

  const tabConfig = [
    { role: "student"    as Role, label: "Students",    icon: GraduationCap, color: "from-indigo-500 to-blue-600",   bg: "bg-indigo-50",  text: "text-indigo-600" },
    { role: "instructor" as Role, label: "Instructors",  icon: Briefcase,     color: "from-emerald-500 to-teal-600",  bg: "bg-emerald-50", text: "text-emerald-600" },
    { role: "admin"      as Role, label: "Admins",       icon: Shield,        color: "from-violet-500 to-purple-600", bg: "bg-violet-50",  text: "text-violet-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const drawerProfile   = drawerUser   ? profiles.get(String(drawerUser._id))   ?? null : null;
  const analysisProfile = analysisUser ? profiles.get(String(analysisUser._id)) ?? null : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-3 gap-4">
        {tabConfig.map(({ role, label, icon: Icon, color, bg, text }) => (
          <Card
            key={role}
            onClick={() => setActiveTab(role)}
            className={`cursor-pointer transition-all hover:shadow-md ${activeTab === role ? "ring-2 ring-offset-1 ring-indigo-500" : ""}`}
          >
            <CardContent className="p-5">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{counts[role]}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          className="pl-10"
          placeholder={`Search ${activeTab}s by name or email...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No {activeTab}s found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((user) => {
                const profile    = profiles.get(String(user._id));
                const hasProfile = !!profile;
                const sp = activeTab === "student" ? (profile as StudentProfile | undefined) : undefined;
                const ip = activeTab === "instructor" ? (profile as InstructorProfile | undefined) : undefined;

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setDrawerUser(user)}
                  >
                    {/* Avatar */}
                    <Avatar className="w-11 h-11 flex-shrink-0">
                      <AvatarFallback className={`font-semibold text-sm ${
                        activeTab === "student"    ? "bg-indigo-100 text-indigo-600" :
                        activeTab === "instructor" ? "bg-emerald-100 text-emerald-600" :
                                                    "bg-violet-100 text-violet-600"
                      }`}>
                        {((sp?.fullName || ip?.fullName || user.username) || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {sp?.fullName || ip?.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      {/* Sub-info by role */}
                      {sp && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sp.department?.name || "No dept"} · Year {sp.year || "—"} ·{" "}
                          {sp.enrollmentNumber || <span className="text-amber-600">No enrollment no.</span>}
                        </p>
                      )}
                      {ip && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ip.department?.name || "No dept"} · {ip.designation || "—"} · {ip.employeeId || "No ID"}
                        </p>
                      )}
                    </div>

                    {/* Profile badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activeTab !== "admin" && (
                        <Badge className={`text-xs ${hasProfile ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {hasProfile ? "Profile ✓" : "No profile"}
                        </Badge>
                      )}

                      {/* Analysis button — only for student/instructor */}
                      {activeTab !== "admin" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                          onClick={(e) => { e.stopPropagation(); setAnalysisUser(user); }}
                          title="View Analysis"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </Button>
                      )}

                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Drawer */}
      {drawerUser && (
        <ProfileDrawer
          user={drawerUser}
          profile={drawerProfile}
          onClose={() => setDrawerUser(null)}
        />
      )}

      {/* Analysis Modal */}
      {analysisUser && analysisUser.role === "student" && (
        <StudentAnalysisModal
          user={analysisUser}
          profile={analysisProfile as StudentProfile | null}
          onClose={() => setAnalysisUser(null)}
        />
      )}
      {analysisUser && analysisUser.role === "instructor" && (
        <InstructorAnalysisModal
          user={analysisUser}
          profile={analysisProfile as InstructorProfile | null}
          onClose={() => setAnalysisUser(null)}
        />
      )}
    </div>
  );
}