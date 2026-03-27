import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { getAnalyticsData } from "../../../services/adminService";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

export function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData()
      .then(setData)
      .catch((err) => console.error("Analytics error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!data) return <div className="p-6">No analytics data</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(data.kpiMetrics || []).map((metric: any) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth (New Users per Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="#e0e7ff" fillOpacity={0.4} name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Submissions / Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Submissions This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.userEngagement || []).some((d: any) => d.active > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.userEngagement || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="active" fill="#6366f1" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                No submission activity this week yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.completionRates || []).some((d: any) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.completionRates || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(data.completionRates || []).map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                No submissions yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Ratings */}
      {(data.courseRatings || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.courseRatings} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} tickCount={6} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [`${v} / 5`, "Rating"]} />
                <Bar dataKey="rating" fill="#8b5cf6" name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
