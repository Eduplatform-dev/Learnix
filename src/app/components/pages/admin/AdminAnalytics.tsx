import { useEffect, useState } from "react";
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
  BarChart,
  Bar,
} from "recharts";

import { getAnalyticsData } from "../../../services/adminService";

type KPI = {
  label: string;
  value: number;
};

type Growth = {
  month: string;
  users: number;
};

type Engagement = {
  day: string;
  active: number;
};

type AnalyticsData = {
  monthlyGrowth: Growth[];
  userEngagement: Engagement[];
  kpiMetrics: KPI[];
};

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await getAnalyticsData();
        setData(res);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!data) return <div className="p-6">No analytics data</div>;

  return (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.kpiMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.monthlyGrowth}>
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
            <BarChart data={data.userEngagement}>
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