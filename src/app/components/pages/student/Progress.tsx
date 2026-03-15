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
  { label: "Average Score", value: "87%", change: "+5%", icon: TrendingUp, color: "text-green-600" },
  { label: "Courses Completed", value: "12", change: "+3", icon: Award, color: "text-blue-600" },
  { label: "Study Streak", value: "30 days", change: "Active", icon: Target, color: "text-purple-600" },
  { label: "Total Study Time", value: "127h", change: "+12h", icon: Clock, color: "text-orange-600" },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, title: "Fast Learner", description: "Completed 5 courses in 3 months", icon: TrendingUp, color: "bg-blue-100 text-blue-600" },
  { id: 2, title: "Top Performer", description: "Scored 95%+ in 3 tests", icon: Award, color: "bg-yellow-100 text-yellow-600" },
  { id: 3, title: "Consistent Study", description: "30-day study streak", icon: Target, color: "bg-orange-100 text-orange-600" },
  { id: 4, title: "Code Master", description: "Completed 100+ coding challenges", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
];

export function Progress() {
  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
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

          <Tabs defaultValue="performance">

            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="study">Study Hours</TabsTrigger>
              <TabsTrigger value="completion">Completion</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={PERFORMANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="score" stroke="#4f46e5"/>
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="study">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={STUDY_HOURS}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="day"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="hours" fill="#10b981"/>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="completion">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={COURSE_COMPLETION} dataKey="value">
                    {COURSE_COMPLETION.map((e,i)=>
                      <Cell key={i} fill={e.color}/>
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
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

            {ACHIEVEMENTS.map(a=>{
              const Icon=a.icon

              return(
                <div key={a.id} className="flex gap-3 border p-4 rounded-lg">
                  <div className={`w-10 h-10 flex items-center justify-center rounded ${a.color}`}>
                    <Icon/>
                  </div>

                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-gray-500">{a.description}</p>
                  </div>

                </div>
              )
            })}

          </div>

        </CardContent>
      </Card>

    </div>
  )
}