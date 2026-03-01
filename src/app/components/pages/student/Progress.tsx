import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Award,
  Target,
  Clock,
  BookOpen,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const PERFORMANCE_DATA = [
  { month: "Jan", score: 75 },
  { month: "Feb", score: 78 },
  { month: "Mar", score: 82 },
  { month: "Apr", score: 80 },
  { month: "May", score: 85 },
  { month: "Jun", score: 87 },
];

const COURSE_COMPLETION = [
  { name: "React", value: 85, color: "#3b82f6" },
  { name: "Python", value: 65, color: "#10b981" },
  { name: "JavaScript", value: 90, color: "#f59e0b" },
  { name: "UI/UX", value: 100, color: "#8b5cf6" },
];

const STUDY_HOURS = [
  { day: "Mon", hours: 4 },
  { day: "Tue", hours: 5 },
  { day: "Wed", hours: 3 },
  { day: "Thu", hours: 6 },
  { day: "Fri", hours: 4 },
  { day: "Sat", hours: 7 },
  { day: "Sun", hours: 5 },
];

const STATS: Stat[] = [
  {
    label: "Average Score",
    value: "87%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    label: "Courses Completed",
    value: "12",
    change: "+3",
    icon: Award,
    color: "text-blue-600",
  },
  {
    label: "Study Streak",
    value: "30 days",
    change: "Active",
    icon: Target,
    color: "text-purple-600",
  },
  {
    label: "Total Study Time",
    value: "127h",
    change: "+12h",
    icon: Clock,
    color: "text-orange-600",
  },
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: "Fast Learner",
    description: "Completed 5 courses in 3 months",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Top Performer",
    description: "Scored 95%+ in 3 tests",
    icon: Award,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 3,
    title: "Consistent Study",
    description: "30-day study streak",
    icon: Target,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 4,
    title: "Code Master",
    description: "Completed 100+ coding challenges",
    icon: BookOpen,
    color: "bg-purple-100 text-purple-600",
  },
];

export function Progress() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Progress Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="study">Study Hours</TabsTrigger>
              <TabsTrigger value="completion">Completion</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={PERFORMANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    name="Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="study">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={STUDY_HOURS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#10b981" name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="completion">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={COURSE_COMPLETION}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {COURSE_COMPLETION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
