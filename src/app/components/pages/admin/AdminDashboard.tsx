import { useEffect, useState } from "react";
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

import { getDashboardData } from "../../../services/adminService";

type DashboardStats = {
  students: number;
  courses: number;
  revenue: number;
  completionRate: number;
};

type DashboardResponse = {
  stats: DashboardStats;
  enrollmentData: { month: string; students: number }[];
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getDashboardData();
        setData(res);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!data) return <div className="p-6">No dashboard data</div>;

  const statCards = [
    { title: "Students", value: data.stats.students, icon: Users },
    { title: "Courses", value: data.stats.courses, icon: BookOpen },
    { title: "Revenue", value: `$${data.stats.revenue}`, icon: DollarSign },
    {
      title: "Completion",
      value: `${data.stats.completionRate}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>

                <Icon className="w-6 h-6 text-indigo-600" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Trend</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.enrollmentData}>
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