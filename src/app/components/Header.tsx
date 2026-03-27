import { Bell, Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const TITLES: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/courses": "My Courses",
  "/dashboard/videos": "Video Library",
  "/dashboard/library": "Resources",
  "/dashboard/progress": "My Progress",
  "/dashboard/assignments": "Assignments",
  "/dashboard/submissions": "Submissions",
  "/dashboard/fees": "Fee Payment",
  "/dashboard/ai-chat": "AI Assistant",

  "/admin/dashboard": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/courses": "Course Management",
  "/admin/analytics": "Analytics",
  "/admin/content": "Content Library",
  "/admin/fees": "Fee Management",
  "/admin/submissions": "Submissions Review",
  "/admin/settings": "System Settings",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const cleanPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  const title = TITLES[cleanPath] || "Dashboard";

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "U";

  const displayName = user?.username || user?.email || "User";

  const handleLogout = () => {
    logout();
    navigate("/login"); // 🔥 fixed redirect
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-64 bg-slate-50"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>New assignment posted</DropdownMenuItem>
              <DropdownMenuItem>Fee reminder</DropdownMenuItem>
              <DropdownMenuItem>New course available</DropdownMenuItem>
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
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}