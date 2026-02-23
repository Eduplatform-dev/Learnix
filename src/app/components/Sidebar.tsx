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
import { UserRole } from "../services/authService";
import { useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

interface SidebarProps {
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole | null;
}

export function Sidebar({
  onPageChange,
  isOpen,
  onClose,
  userRole,
}: SidebarProps) {
  const { user } = useAuth();

  if (!userRole) return null;

  const location = useLocation();

  let activePage = location.pathname.replace(/^\/+/, "");

  if (activePage.startsWith("dashboard/")) {
    activePage = activePage.replace("dashboard/", "");
  }

  if (activePage.startsWith("admin/")) {
    activePage = "admin-" + activePage.replace("admin/", "");
  }

  if (!activePage || activePage === "dashboard") {
    activePage = userRole === "admin" ? "admin-dashboard" : "dashboard";
  }

  /* INITIALS */
  const initials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  /* MENUS */
  const userMenuItems: MenuItem[] = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "videos", label: "Video Library", icon: PlayCircle },
    { id: "library", label: "Resources", icon: FolderOpen },
    { id: "progress", label: "My Progress", icon: LineChart },
    { id: "assignments", label: "Assignments", icon: FileText, badge: 3 },
    { id: "submissions", label: "Submissions", icon: Upload },
    { id: "fees", label: "Fee Payment", icon: DollarSign },
    { id: "ai-chat", label: "AI Assistant", icon: MessageSquare },
  ];

  const adminMenuItems: MenuItem[] = [
    { id: "admin-dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "admin-users", label: "Students", icon: Users },
    { id: "admin-courses", label: "Courses", icon: BookOpen },
    { id: "admin-analytics", label: "Analytics", icon: LineChart },
    { id: "admin-content", label: "Content", icon: FolderOpen },
    { id: "admin-fees", label: "Fees", icon: DollarSign },
    { id: "admin-submissions", label: "Submissions", icon: Upload, badge: 12 },
    { id: "admin-settings", label: "Settings", icon: Settings },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems;

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
            <h1 className="font-bold text-slate-900">EduPlatform</h1>
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
            const isActive = activePage === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start rounded-xl"
                onClick={() => {
                  onPageChange(item.id);
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

      {/* USER */}
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
