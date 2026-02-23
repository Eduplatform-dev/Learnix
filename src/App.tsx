import { type ReactNode, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "./app/providers/AuthProvider";

import type { UserRole } from "./app/services/authService";

import { Sidebar } from "./app/components/Sidebar";
import { Header } from "./app/components/Header";
import { Login } from "./app/components/Login";

/* ===================== STUDENT PAGES ===================== */
import { Dashboard } from "./app/components/pages/std/Dashboard";
import { Courses } from "./app/components/pages/std/Courses";
import { Videos } from "./app/components/pages/std/Videos";
import { Progress } from "./app/components/pages/std/Progress";
import { Assignments } from "./app/components/pages/std/Assignments";
import { Submissions } from "./app/components/pages/std/Submissions";
import { Fees } from "./app/components/pages/std/Fees";
import { AIChat } from "./app/components/pages/std/AIChat";
import { ContentLibrary } from "./app/components/pages/std/ContentLibrary";

/* ===================== ADMIN PAGES ===================== */
/* ⚠️ make sure folder name is correct: admin not adn */
import { AdminDashboard } from "./app/components/pages/adn/AdminDashboard";
import { AdminUsers } from "./app/components/pages/adn/AdminUsers";
import { AdminCourses } from "./app/components/pages/adn/AdminCourses";
import { AdminAnalytics } from "./app/components/pages/adn/AdminAnalytics";
import { AdminContent } from "./app/components/pages/adn/AdminContent";
import { AdminFees } from "./app/components/pages/adn/AdminFees";
import { AdminSubmissions } from "./app/components/pages/adn/AdminSubmissions";
import { AdminSettings } from "./app/components/pages/adn/AdminSettings";

/* =========================================================
   🔐 PROTECTED ROUTE WRAPPER
========================================================= */
function ProtectedLayout({
  role,
  userRole,
  children,
}: {
  role: UserRole;
  userRole: UserRole | null;
  children: ReactNode;
}) {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return (
      <Navigate
        to={userRole === "admin" ? "/admin/dashboard" : "/dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
}

/* =========================================================
   🎓 USER SHELL
========================================================= */
function UserShell({ userRole }: { userRole: UserRole }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onPageChange={(id) => {
          navigate(id === "dashboard" ? "/dashboard" : `/dashboard/${id}`);
        }}
      />

      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="videos" element={<Videos />} />
            <Route path="library" element={<ContentLibrary />} />
            <Route path="progress" element={<Progress />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="fees" element={<Fees />} />
            <Route path="ai-chat" element={<AIChat />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   🛠 ADMIN SHELL
========================================================= */
function AdminShell({ userRole }: { userRole: UserRole }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onPageChange={(id) => {
          const page = id.replace("admin-", "");
          navigate(
            page === "dashboard"
              ? "/admin/dashboard"
              : `/admin/${page}`
          );
        }}
      />

      <div className="flex-1 lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="settings" element={<AdminSettings />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
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
        Loading...
      </div>
    );
  }

  const userRole = user?.role ?? null;

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            userRole ? (
              <Navigate
                to={userRole === "admin" ? "/admin/dashboard" : "/dashboard"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* USER */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedLayout role="user" userRole={userRole}>
              <UserShell userRole="user" />
            </ProtectedLayout>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <ProtectedLayout role="admin" userRole={userRole}>
              <AdminShell userRole="admin" />
            </ProtectedLayout>
          }
        />

        {/* GLOBAL FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                userRole
                  ? userRole === "admin"
                    ? "/admin/dashboard"
                    : "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
