import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import { getDashboardData } from "../../../services/adminService";

type DashboardStats = {
  students: number;
  courses: number;
  revenue: number;
  completionRate: number;
};

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardData();

        setStats(data?.stats ?? null);
        setEnrollmentData(data?.enrollmentData ?? []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  /* ================= SAFE FALLBACK ================= */

  const safeStats: DashboardStats = {
    students: stats?.students ?? 0,
    courses: stats?.courses ?? 0,
    revenue: stats?.revenue ?? 0,
    completionRate: stats?.completionRate ?? 0,
  };

  const statCards = [
    {
      title: "Total Students",
      value: safeStats.students,
      icon: Users,
      color: "from-indigo-600 to-blue-600",
    },
    {
      title: "Active Courses",
      value: safeStats.courses,
      icon: BookOpen,
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Revenue",
      value: `$${safeStats.revenue}`,
      icon: DollarSign,
      color: "from-violet-600 to-purple-600",
    },
    {
      title: "Completion Rate",
      value: `${safeStats.completionRate}%`,
      icon: TrendingUp,
      color: "from-orange-600 to-amber-600",
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="text-white/90 mt-1">
          Live analytics from database
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}
                >
                  <Icon className="text-white" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Trend</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}