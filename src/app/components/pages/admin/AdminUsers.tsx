import { useEffect, useState, useCallback } from "react";
import {
  GraduationCap, Shield, Search, BarChart2, X,
  ChevronRight, BookOpen, FileText, CheckCircle, Clock,
  TrendingUp, Award, AlertCircle, Briefcase, Building2,
  Hash, Calendar, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const PIE_COLORS   = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

type Role = "student" | "instructor";

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
  totalSubmissions:   number;
  gradedSubmissions:  number;
  averageGrade:       number | null;
  submissionTrend:    { month: string; count: number }[];
  gradeDistribution:  { range: string; count: number }[];
  coursesCreated?:    number;
  totalStudentsTaught?: number;
  pendingToGrade?:    number;
  gradedTotal?:       number;
  avgGradeGiven?:     number | null;
  courseBreakdown?:   { name: string; percent: number }[];
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
function StudentAnalysisModal({ user, profile, onClose }: { user: UserRow; profile: StudentProfile | null; onClose: () => void }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const subs = await apiFetch<any[]>(`/api/submissions?studentId=${user._id}&limit=200`).catch(() => []);
        const arr  = Array.isArray(subs) ? subs : [];
        const graded = arr.filter((s: any) => s.status === "graded");
        const grades = graded.map((s: any) => {
          const m = String(s.grade || "").match(/(\d+)\s*\/\s*(\d+)/);
          if (m) return Math.round((+m[1] / +m[2]) * 100);
          const n = parseFloat(s.grade);
          return isNaN(n) ? null : n;
        }).filter((g): g is number => g !== null);

        const avgGrade = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;
        const months   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const now      = new Date();
        const trend    = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return { month: months[d.getMonth()], count: arr.filter((s: any) => {
            const c = new Date(s.createdAt);
            return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
          }).length };
        });
        const gradeDistribution = [
          { range: "90-100", min: 90, max: 100 }, { range: "75-89", min: 75, max: 89 },
          { range: "60-74", min: 60, max: 74  }, { range: "< 60",  min: 0,  max: 59  },
        ].map(({ range, min, max }) => ({ range, count: grades.filter(g => g >= min && g <= max).length }));

        setAnalysis({ totalSubmissions: arr.length, gradedSubmissions: graded.length, averageGrade: avgGrade, submissionTrend: trend, gradeDistribution });
      } finally { setLoading(false); }
    };
    load();
  }, [user._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
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
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Submissions", value: analysis?.totalSubmissions ?? 0,  icon: FileText,    color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Graded",            value: analysis?.gradedSubmissions ?? 0, icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50" },
                { label: "Pending",           value: (analysis?.totalSubmissions ?? 0) - (analysis?.gradedSubmissions ?? 0), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Avg Grade",         value: analysis?.averageGrade != null ? `${analysis.averageGrade}%` : "N/A", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((s) => { const Icon = s.icon; return (
                <Card key={s.label}><CardContent className="p-4">
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}><Icon className={`w-4 h-4 ${s.color}`} /></div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </CardContent></Card>
              ); })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader><CardTitle className="text-sm">Submission Activity</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.submissionTrend.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analysis.submissionTrend}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="Submissions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No submissions yet</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Grade Distribution</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.gradeDistribution.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={analysis.gradeDistribution.filter(d => d.count > 0)} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={70} label={(p: any) => `${p.payload.range}: ${p.payload.count}`}>
                          {analysis.gradeDistribution.filter(d => d.count > 0).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie><Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No graded submissions</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INSTRUCTOR ANALYSIS MODAL
══════════════════════════════════════════════════════ */
function InstructorAnalysisModal({ user, profile, onClose }: { user: UserRow; profile: InstructorProfile | null; onClose: () => void }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, subsRes] = await Promise.all([
          apiFetch<any>(`/api/courses?limit=200`).catch(() => ({ courses: [] })),
          apiFetch<any[]>(`/api/submissions?limit=500`).catch(() => []),
        ]);
        const allCourses = (coursesRes?.courses ?? []).filter(
          (c: any) => String(c.instructor?._id || c.instructor) === String(user._id)
        );
        const subs   = Array.isArray(subsRes) ? subsRes : [];
        const graded = subs.filter((s: any) => s.status === "graded");
        const totalStudents = new Set(allCourses.flatMap((c: any) => c.enrolledStudents || [])).size;
        const grades = graded.map((s: any) => {
          const m = String(s.grade || "").match(/(\d+)\s*\/\s*(\d+)/);
          if (m) return Math.round((+m[1] / +m[2]) * 100);
          const n = parseFloat(s.grade);
          return isNaN(n) ? null : n;
        }).filter((g): g is number => g !== null);
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const now    = new Date();
        const trend  = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return { month: months[d.getMonth()], count: graded.filter((s: any) => {
            const c = new Date(s.gradedAt || s.updatedAt);
            return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
          }).length };
        });

        setAnalysis({
          totalSubmissions: subs.length, gradedSubmissions: graded.length, averageGrade: null,
          submissionTrend: trend, gradeDistribution: [],
          coursesCreated: allCourses.length, totalStudentsTaught: totalStudents,
          pendingToGrade: subs.filter((s: any) => s.status === "submitted").length,
          gradedTotal: graded.length,
          avgGradeGiven: grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null,
          courseBreakdown: allCourses.slice(0, 5).map((c: any) => ({
            name:    c.title.length > 18 ? c.title.slice(0, 16) + "…" : c.title,
            percent: c.enrolledStudents?.length ?? 0,
          })),
        });
      } finally { setLoading(false); }
    };
    load();
  }, [user._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
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
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Courses Created",   value: analysis?.coursesCreated ?? 0,      icon: BookOpen,    color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Students Taught",   value: analysis?.totalStudentsTaught ?? 0,  icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Graded",            value: analysis?.gradedTotal ?? 0,           icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                { label: "Pending to Grade",  value: analysis?.pendingToGrade ?? 0,        icon: Clock,       color: "text-amber-600", bg: "bg-amber-50" },
              ].map((s) => { const Icon = s.icon; return (
                <Card key={s.label}><CardContent className="p-4">
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}><Icon className={`w-4 h-4 ${s.color}`} /></div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </CardContent></Card>
              ); })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader><CardTitle className="text-sm">Grading Activity (6 months)</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.submissionTrend.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analysis.submissionTrend}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
                        <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} name="Graded" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No grading activity yet</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Students per Course</CardTitle></CardHeader>
                <CardContent>
                  {analysis?.courseBreakdown && analysis.courseBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analysis.courseBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                        <Tooltip /><Bar dataKey="percent" fill="#6366f1" radius={[0,4,4,0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No courses yet</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROFILE DETAIL DRAWER
══════════════════════════════════════════════════════ */
function ProfileDrawer({ user, profile, onClose }: { user: UserRow; profile: StudentProfile | InstructorProfile | null; onClose: () => void }) {
  const isStudent = user.role === "student";
  const sp = isStudent ? (profile as StudentProfile | null) : null;
  const ip = !isStudent ? (profile as InstructorProfile | null) : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-40">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{isStudent ? "Student" : "Instructor"} Profile</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className={`text-xl font-bold ${isStudent ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                {((profile as any)?.fullName?.slice(0, 2) || user.username.slice(0, 2)).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-gray-900">{(profile as any)?.fullName || user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge className={`text-xs mt-1 ${isStudent ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>{user.role}</Badge>
            </div>
          </div>
          {!profile ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Profile not submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {isStudent && sp && [
                ["Enrollment No.", sp.enrollmentNumber || "Not assigned"],
                ["Department",    sp.department?.name || "—"],
                ["Dept. Code",    sp.department?.code || "—"],
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
              {!isStudent && ip && [
                ["Employee ID",    ip.employeeId || "—"],
                ["Department",    ip.department?.name || "—"],
                ["Dept. Code",    ip.department?.code || "—"],
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
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export function AdminUsers() {
  const [users,     setUsers]     = useState<UserRow[]>([]);
  const [profiles,  setProfiles]  = useState<Map<string, StudentProfile | InstructorProfile>>(new Map());
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState<Role>("student");

  const [drawerUser,   setDrawerUser]   = useState<UserRow | null>(null);
  const [analysisUser, setAnalysisUser] = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<UserRow[]>("/api/users?limit=200");
      setUsers(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const endpoint = activeTab === "student"
          ? "/api/profiles/students?limit=200"
          : "/api/profiles/instructors";
        const res  = await apiFetch<any>(endpoint);
        const list = activeTab === "student" ? (res.profiles ?? res) : res;
        const map  = new Map<string, StudentProfile | InstructorProfile>();
        (Array.isArray(list) ? list : []).forEach((p: any) => {
          const uid = p.user?._id || p.user;
          if (uid) map.set(String(uid), p);
        });
        setProfiles(map);
      } catch {}
    };
    loadProfiles();
  }, [activeTab]);

  const filtered = users.filter(u => {
    if (u.role !== activeTab) return false;
    if (!search) return true;
    return u.username.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase());
  });

  const counts = {
    student:    users.filter(u => u.role === "student").length,
    instructor: users.filter(u => u.role === "instructor").length,
  };

  const tabConfig = [
    { role: "student"    as Role, label: "Students",    icon: GraduationCap, color: "from-indigo-500 to-blue-600",  bg: "bg-indigo-50",  text: "text-indigo-600"  },
    { role: "instructor" as Role, label: "Instructors",  icon: Briefcase,     color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const drawerProfile   = drawerUser   ? (profiles.get(String(drawerUser._id))   ?? null) : null;
  const analysisProfile = analysisUser ? (profiles.get(String(analysisUser._id)) ?? null) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-2 gap-4">
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
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No {activeTab}s found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    {activeTab === "student" ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment No.</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(user => {
                    const profile = profiles.get(String(user._id));
                    const sp = activeTab === "student"    ? (profile as StudentProfile    | undefined) : undefined;
                    const ip = activeTab === "instructor" ? (profile as InstructorProfile | undefined) : undefined;

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 flex-shrink-0">
                              <AvatarFallback className={`font-semibold text-sm ${activeTab === "student" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                                {((sp?.fullName || ip?.fullName || user.username) || "U").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                                {sp?.fullName || ip?.fullName || user.username}
                              </p>
                              <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3">
                          {(sp?.department || ip?.department) ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-700">{sp?.department?.name || ip?.department?.name || "—"}</span>
                              <Badge variant="outline" className="text-xs ml-1">{sp?.department?.code || ip?.department?.code}</Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not set</span>
                          )}
                        </td>

                        {/* Student: Year + Enrollment / Instructor: Designation + Employee ID */}
                        {activeTab === "student" ? (
                          <>
                            <td className="px-4 py-3">
                              {sp?.year ? (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-sm text-gray-700">Year {sp.year}</span>
                                  {sp.division && <span className="text-xs text-gray-400">· Div {sp.division}</span>}
                                </div>
                              ) : <span className="text-xs text-gray-400 italic">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              {sp?.enrollmentNumber ? (
                                <div className="flex items-center gap-1.5">
                                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-sm font-mono font-medium text-indigo-700">{sp.enrollmentNumber}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-amber-600 italic">Not assigned</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">{ip?.designation || <span className="text-xs text-gray-400 italic">—</span>}</span>
                            </td>
                            <td className="px-4 py-3">
                              {ip?.employeeId ? (
                                <div className="flex items-center gap-1.5">
                                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-sm font-mono font-medium text-emerald-700">{ip.employeeId}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-amber-600 italic">Not assigned</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Profile status */}
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${profile ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {profile ? "Submitted ✓" : "Pending"}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                              title="View profile"
                              onClick={() => setDrawerUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                              title="View analysis"
                              onClick={() => setAnalysisUser(user)}
                            >
                              <BarChart2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Drawer */}
      {drawerUser && (
        <ProfileDrawer user={drawerUser} profile={drawerProfile} onClose={() => setDrawerUser(null)} />
      )}

      {/* Analysis Modal */}
      {analysisUser && analysisUser.role === "student" && (
        <StudentAnalysisModal user={analysisUser} profile={analysisProfile as StudentProfile | null} onClose={() => setAnalysisUser(null)} />
      )}
      {analysisUser && analysisUser.role === "instructor" && (
        <InstructorAnalysisModal user={analysisUser} profile={analysisProfile as InstructorProfile | null} onClose={() => setAnalysisUser(null)} />
      )}
    </div>
  );
}
