import { Bell, Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TITLES: Record<string, string> = {
  // Student
  "/dashboard":              "Home",
  "/dashboard/courses":      "My Courses",
  "/dashboard/videos":       "Video Library",
  "/dashboard/library":      "Resources",
  "/dashboard/progress":     "My Progress",
  "/dashboard/assignments":  "Assignments",
  "/dashboard/submissions":  "Submissions",
  "/dashboard/fees":         "Fee Payment",
  "/dashboard/ai-chat":      "AI Assistant",
  // Admin
  "/admin/dashboard":        "Admin Dashboard",
  "/admin/users":            "User Management",
  "/admin/courses":          "Course Management",
  "/admin/analytics":        "Analytics",
  "/admin/content":          "Content Library",
  "/admin/fees":             "Fee Management",
  "/admin/submissions":      "Submissions Review",
  "/admin/settings":         "System Settings",
  "/admin/departments":      "Departments",
  // Instructor
  "/instructor/dashboard":   "Instructor Dashboard",
  "/instructor/courses":     "My Courses",
  "/instructor/assignments": "Assignments",
  "/instructor/submissions": "Grade Submissions",
  "/instructor/students":    "My Students",
  "/instructor/content":     "Content Library",
  "/instructor/ai-chat":     "AI Assistant",
};

type NotifItem = {
  _id:       string;
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
  type:      string;
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifOpen,     setNotifOpen]     = useState(false);

  const cleanPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const title     = TITLES[cleanPath] || "Dashboard";

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "U";

  const displayName = user?.username || user?.email || "User";

  /* ── Fetch notifications ── */
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE_URL}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Notifications are non-critical
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 s
      const id = setInterval(fetchNotifications, 60_000);
      return () => clearInterval(id);
    }
  }, [user]);

  const markRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      assignment:          "Assignment",
      fee_due:             "Fee Due",
      fee_paid:            "Fee Paid",
      submission_graded:   "Graded",
      course_enrolled:     "Enrolled",
      attendance_warning:  "Attendance",
      announcement:        "Notice",
      system:              "System",
    };
    return map[type] || "Notice";
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="w-6 h-6" />
          </Button>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input type="search" placeholder="Search..." className="pl-10 w-64 bg-slate-50" />
          </div>

          {/* Notifications */}
          <DropdownMenu modal={false} open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) fetchNotifications(); }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center p-0 px-1 bg-red-500 text-white text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button
                    className="text-xs text-indigo-600 hover:underline"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n._id}
                    className={`flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer ${
                      !n.isRead ? "bg-indigo-50/60" : ""
                    }`}
                    onClick={() => !n.isRead && markRead(n._id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs text-indigo-600 font-medium">{typeLabel(n.type)}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full ml-auto shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p>{displayName}</p>
                  <p className="text-xs text-gray-400 font-normal capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}