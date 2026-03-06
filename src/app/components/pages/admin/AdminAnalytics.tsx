import {
  TrendingUp,
  Award,
  Target,
  Activity,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../../services/adminService";

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalyticsData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ✅ CRASH PROTECTION */
  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!data) return <div className="p-6">No analytics data</div>;

  const {
    monthlyGrowth = [],
    userEngagement = [],
    courseRatings = [],
    trafficSources = [],
    completionRates = [],
    kpiMetrics = [],
  } = data;

  return (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}