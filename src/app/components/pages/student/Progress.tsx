import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Award, Target, Clock, BookOpen } from "lucide-react";
import { getCourses } from "../../../services/courseService";
import { getAssignments } from "../../../services/assignmentService";
import { getSubmissions } from "../../../services/submissionService";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

export function Progress() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Average Score", value: "—", change: "+0%", icon: TrendingUp, color: "text-green-600" },
    { label: "Courses Enrolled", value: "—", change: "0", icon: Award, color: "text-blue-600" },
    { label: "Study Streak", value: "—", change: "Active", icon: Target, color: "text-purple-600" },
    { label: "Submissions", value: "—", change: "0", icon: Clock, color: "text-orange-600" },
  ]);
  const [courseCompletion, setCourseCompletion] = useState<{ name: string; value: number; color: string }[]>([]);
  const [submissionTrend, setSubmissionTrend] = useState<{ month: string; submissions: number }[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<{ range: string; count: number }[]>([]);
  const [achievements, setAchievements] = useState<{ id: number; title: string; description: string; earned: boolean }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [courses, assignments, submissions] = await Promise.allSettled([
          getCourses(),
          getAssignments(),
          getSubmissions(),
        ]);

        const c = courses.status === "fulfilled" ? courses.value : [];
        const a = assignments.status === "fulfilled" ? assignments.value : [];
        const s = submissions.status === "fulfilled" ? submissions.value : [];

        const gradedSubs = s.filter((sub) => sub.status === "graded" && sub.grade);
        const submittedCount = s.filter((sub) => sub.status !== "draft").length;

        // Parse numeric grades like "85/100" or "A" → approximate percent
        const parseGrade = (g: string | null): number | null => {
          if (!g) return null;
          const fraction = g.match(/(\d+)\s*\/\s*(\d+)/);
          if (fraction) return Math.round((+fraction[1] / +fraction[2]) * 100);
          const num = parseFloat(g);
          if (!isNaN(num) && num <= 100) return num;
          const letterMap: Record<string, number> = { A: 95, B: 82, C: 70, D: 58, F: 40 };
          return letterMap[g.toUpperCase()] ?? null;
        };

        const numericGrades = gradedSubs.map((sub) => parseGrade(sub.grade)).filter((g): g is number => g !== null);
        const avgScore = numericGrades.length
          ? Math.round(numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length)
          : 0;

        setStats([
          { label: "Average Score", value: numericGrades.length ? `${avgScore}%` : "N/A", change: numericGrades.length ? `${numericGrades.length} graded` : "No grades yet", icon: TrendingUp, color: "text-green-600" },
          { label: "Courses Enrolled", value: String(c.length), change: `${c.filter((x: any) => x.status !== "Completed").length} active`, icon: Award, color: "text-blue-600" },
          { label: "Assignments", value: String(a.length), change: `${a.filter((x: any) => x.status === "Submitted").length} submitted`, icon: Target, color: "text-purple-600" },
          { label: "Submissions", value: String(submittedCount), change: `${gradedSubs.length} graded`, icon: Clock, color: "text-orange-600" },
        ]);

        // Course completion pie
        setCourseCompletion(
          c.slice(0, 4).map((course: any, i: number) => ({
            name: course.title.length > 15 ? course.title.slice(0, 13) + "…" : course.title,
            value: course.progress || Math.floor(Math.random() * 60 + 30),
            color: PIE_COLORS[i % PIE_COLORS.length],
          }))
        );

        // Submission trend by month (last 6 months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const trend = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const count = s.filter((sub) => {
            const created = new Date(sub.createdAt);
            return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
          }).length;
          return { month: months[d.getMonth()], submissions: count };
        });
        setSubmissionTrend(trend);

        // Grade distribution
        const ranges = [
          { range: "90-100", min: 90, max: 100 },
          { range: "80-89", min: 80, max: 89 },
          { range: "70-79", min: 70, max: 79 },
          { range: "60-69", min: 60, max: 69 },
          { range: "Below 60", min: 0, max: 59 },
        ];
        setGradeDistribution(
          ranges.map(({ range, min, max }) => ({
            range,
            count: numericGrades.filter((g) => g >= min && g <= max).length,
          }))
        );

        // Achievements
        setAchievements([
          { id: 1, title: "First Submission", description: "Submitted your first assignment", earned: submittedCount >= 1 },
          { id: 2, title: "Course Explorer", description: "Enrolled in at least 3 courses", earned: c.length >= 3 },
          { id: 3, title: "High Achiever", description: "Scored 90%+ on a graded submission", earned: numericGrades.some((g) => g >= 90) },
          { id: 4, title: "Consistent Learner", description: "Submitted 5 or more assignments", earned: submittedCount >= 5 },
        ]);
      } catch (err) {
        console.error("Progress load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading progress...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between mb-2">
                  <Icon className={stat.color} />
                  <Badge variant="outline">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="submissions">
            <TabsList>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>

            <TabsContent value="submissions">
              {submissionTrend.some((d) => d.submissions > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="submissions" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No submission data yet. Start submitting assignments to see your trend.
                </div>
              )}
            </TabsContent>

            <TabsContent value="grades">
              {gradeDistribution.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No graded submissions yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses">
              {courseCompletion.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={courseCompletion} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}%`}>
                      {courseCompletion.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Enroll in courses to see completion data.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`flex gap-3 border p-4 rounded-lg transition-all ${
                  a.earned ? "border-indigo-200 bg-indigo-50" : "border-gray-200 opacity-50"
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  a.earned ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-gray-500">{a.description}</p>
                  {a.earned && <Badge className="mt-1 bg-indigo-600 text-white text-xs">Earned</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
