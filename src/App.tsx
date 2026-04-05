import { type ReactNode, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./app/providers/AuthProvider";
import type { UserRole } from "./app/services/authService";

import { Sidebar } from "./app/components/Sidebar";
import { Header }  from "./app/components/Header";
import { Login }   from "./app/components/Login";

/* ================= STUDENT PAGES ================= */
import { Dashboard }      from "./app/components/pages/student/Dashboard";
import { Courses }        from "./app/components/pages/student/Courses";
import { CourseViewer }   from "./app/components/pages/student/CourseViewer";
import { Videos }         from "./app/components/pages/student/Videos";
import { Progress }       from "./app/components/pages/student/Progress";
import { Assignments }    from "./app/components/pages/student/Assignments";
import { Submissions }    from "./app/components/pages/student/Submissions";
import { Fees }           from "./app/components/pages/student/Fees";
import { AIChat }         from "./app/components/pages/student/AIChat";
import { ContentLibrary } from "./app/components/pages/student/ContentLibrary";
import { Attendance }    from "./app/components/pages/student/Attendance";
import { DocumentHub }   from "./app/components/pages/student/DocumentHub";
import { TimetableView } from "./app/components/pages/student/TimetableView";

/* ================= ADMIN PAGES ================= */
import { AdminDashboard }   from "./app/components/pages/admin/AdminDashboard";
import { AdminUsers }       from "./app/components/pages/admin/AdminUsers";
import { AdminCourses }     from "./app/components/pages/admin/AdminCourses";
import { AdminAnalytics }   from "./app/components/pages/admin/AdminAnalytics";
import { AdminContent }     from "./app/components/pages/admin/AdminContent";
import { AdminFees }        from "./app/components/pages/admin/AdminFees";
import { AdminSubmissions } from "./app/components/pages/admin/AdminSubmissions";
import { AdminSettings }    from "./app/components/pages/admin/AdminSettings";
import { AdminDocuments }  from "./app/components/pages/admin/AdminDocuments";
import { AdminTimetable }  from "./app/components/pages/admin/AdminTimetable";

/* ================= INSTRUCTOR PAGES ================= */
import { InstructorDashboard }   from "./app/components/pages/instructor/InstructorDashboard";
import { InstructorCourses }     from "./app/components/pages/instructor/InstructorCourses";
import { InstructorAssignments } from "./app/components/pages/instructor/InstructorAssignments";
import { InstructorSubmissions } from "./app/components/pages/instructor/InstructorSubmissions";
import { InstructorContent }     from "./app/components/pages/instructor/InstructorContent";
import { InstructorStudents }    from "./app/components/pages/instructor/InstructorStudents";
import { InstructorAttendance } from "./app/components/pages/instructor/InstructorAttendance";

/* =========================================================
   🔐 PROTECTED ROUTE WRAPPER
========================================================= */
function ProtectedLayout({
  roles, userRole, children,
}: {
  roles: UserRole[];
  userRole: UserRole | null;
  children: ReactNode;
}) {
  if (!userRole) return <Navigate to="/login" replace />;
  if (!roles.includes(userRole)) {
    const redirectPath =
      userRole === "admin"       ? "/admin/dashboard" :
      userRole === "instructor"  ? "/instructor/dashboard" :
      "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
}

/* =========================================================
   🧩 SHARED LAYOUT
========================================================= */
function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

/* =========================================================
   🎓 STUDENT ROUTES
========================================================= */
function UserRoutes() {
  return (
    <Routes>
      <Route index           element={<Dashboard />} />
      <Route path="courses"     element={<Courses />} />
      <Route path="videos"      element={<Videos />} />
      <Route path="library"     element={<ContentLibrary />} />
      <Route path="progress"    element={<Progress />} />
      <Route path="assignments" element={<Assignments />} />
      <Route path="submissions" element={<Submissions />} />
      <Route path="fees"        element={<Fees />} />
      <Route path="ai-chat"     element={<AIChat />} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
      <Route path="attendance"  element={<Attendance />} />
      <Route path="documents"   element={<DocumentHub />} />
      <Route path="timetable"   element={<TimetableView />} />
    </Routes>
  );
}

/* =========================================================
   🛠 ADMIN ROUTES
========================================================= */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard"   element={<AdminDashboard />} />
      <Route path="users"       element={<AdminUsers />} />
      <Route path="courses"     element={<AdminCourses />} />
      <Route path="analytics"   element={<AdminAnalytics />} />
      <Route path="content"     element={<AdminContent />} />
      <Route path="fees"        element={<AdminFees />} />
      <Route path="submissions" element={<AdminSubmissions />} />
      <Route path="settings"    element={<AdminSettings />} />
      <Route path="*"           element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="documents"   element={<AdminDocuments />} />
      <Route path="timetable"   element={<AdminTimetable />} />
    </Routes>
  );
}

/* =========================================================
   👩‍🏫 INSTRUCTOR ROUTES
========================================================= */
function InstructorRoutes() {
  return (
    <Routes>
      <Route path="dashboard"   element={<InstructorDashboard />} />
      <Route path="courses"     element={<InstructorCourses />} />
      <Route path="assignments" element={<InstructorAssignments />} />
      <Route path="submissions" element={<InstructorSubmissions />} />
      <Route path="content"     element={<InstructorContent />} />
      <Route path="students"    element={<InstructorStudents />} />
      <Route path="ai-chat"     element={<AIChat />} />
      <Route path="*"           element={<Navigate to="/instructor/dashboard" replace />} />
      <Route path="attendance"  element={<InstructorAttendance />} />
    </Routes>
  );
}

/* =========================================================
   🚀 APP ROOT
========================================================= */
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role ?? null;
  const redirectPath =
    !userRole          ? "/login" :
    userRole === "admin"       ? "/admin/dashboard" :
    userRole === "instructor"  ? "/instructor/dashboard" :
    "/dashboard";

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={userRole ? <Navigate to={redirectPath} replace /> : <Login />}
      />

      {/* COURSE VIEWER — full screen, no sidebar */}
      <Route
        path="/dashboard/courses/:courseId"
        element={
          <ProtectedLayout roles={["student"]} userRole={userRole}>
            <CourseViewer />
          </ProtectedLayout>
        }
      />

      {/* STUDENT */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedLayout roles={["student"]} userRole={userRole}>
            <AppShell><UserRoutes /></AppShell>
          </ProtectedLayout>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin/*"
        element={
          <ProtectedLayout roles={["admin"]} userRole={userRole}>
            <AppShell><AdminRoutes /></AppShell>
          </ProtectedLayout>
        }
      />

      {/* INSTRUCTOR */}
      <Route
        path="/instructor/*"
        element={
          <ProtectedLayout roles={["instructor"]} userRole={userRole}>
            <AppShell><InstructorRoutes /></AppShell>
          </ProtectedLayout>
        }
      />

      {/* GLOBAL FALLBACK */}
      <Route path="*" element={<Navigate to={redirectPath} replace />} />
    </Routes>
  );
}
