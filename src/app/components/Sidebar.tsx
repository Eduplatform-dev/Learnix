// src/app/components/Sidebar.tsx

import {
  Home,
  BookOpen,
  PlayCircle,
  LineChart,
  FileText,
  Upload,
  DollarSign,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  FolderOpen,
  Shield,
} from "lucide-react";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../providers/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type UserRole = "student" | "admin" | "instructor";

type MenuItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  /** exact=true means only highlight when path matches exactly */
  exact?: boolean;
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role as UserRole | undefined;

  if (!userRole) return null;

  const activePath = location.pathname;

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  /* ================= MENUS ================= */

  const studentMenu: MenuItem[] = [
    { path: "/dashboard", label: "Home", icon: Home, exact: true },
    { path: "/dashboard/courses", label: "My Courses", icon: BookOpen },
    { path: "/dashboard/videos", label: "Video Library", icon: PlayCircle },
    { path: "/dashboard/library", label: "Resources", icon: FolderOpen },
    { path: "/dashboard/progress", label: "My Progress", icon: LineChart },
    { path: "/dashboard/assignments", label: "Assignments", icon: FileText },
    { path: "/dashboard/submissions", label: "Submissions", icon: Upload },
    { path: "/dashboard/fees", label: "Fee Payment", icon: DollarSign },
    { path: "/dashboard/ai-chat", label: "AI Assistant", icon: MessageSquare },
  ];

  const adminMenu: MenuItem[] = [
    { path: "/admin/dashboard", label: "Dashboard", icon: BarChart3, exact: true },
    { path: "/admin/users", label: "Students", icon: Users },
    { path: "/admin/courses", label: "Courses", icon: BookOpen },
    { path: "/admin/analytics", label: "Analytics", icon: LineChart },
    { path: "/admin/content", label: "Content", icon: FolderOpen },
    { path: "/admin/fees", label: "Fees", icon: DollarSign },
    { path: "/admin/submissions", label: "Submissions", icon: Upload },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const menuItems = userRole === "admin" ? adminMenu : studentMenu;

  return (
    <div
      className={`w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 shadow-sm ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              userRole === "admin"
                ? "bg-gradient-to-br from-violet-600 to-purple-600"
                : "bg-gradient-to-br from-indigo-600 to-blue-600"
            }`}
          >
            {userRole === "admin" ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <BookOpen className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Learnix</h1>
            <p className="text-xs text-slate-500">
              {userRole === "admin" ? "Admin Portal" : "Student Portal"}
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            // FIX: exact items only highlight on exact match
            // Non-exact items highlight when activePath starts with item.path
            const isActive = item.exact
              ? activePath === item.path
              : activePath === item.path || activePath.startsWith(item.path + "/");

            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start rounded-xl"
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* USER INFO */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
