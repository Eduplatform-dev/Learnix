// src/app/components/pages/student/Dashboard.tsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Clock, BookOpen, Award, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../ImageWithFallback";
import headerImage from "../../../../assets/image.png";

import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getCourses, type Course } from "../../../services/courseService";
import { getAssignments, type Assignment } from "../../../services/assignmentService";

export function Dashboard() {
  const { user } = useCurrentUser();

  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // Fetch independently so one failure doesn't block the other
        const [courseResult, assignmentResult] = await Promise.allSettled([
          getCourses(),
          getAssignments(),
        ]);

        if (courseResult.status === "fulfilled") {
          setCourses(courseResult.value);
        } else {
          console.error("Courses fetch failed:", courseResult.reason);
        }

        if (assignmentResult.status === "fulfilled") {
          setAssignments(assignmentResult.value);
        } else {
          console.error("Assignments fetch failed:", assignmentResult.reason);
        }

        // Show error only if BOTH fail
        if (
          courseResult.status === "rejected" &&
          assignmentResult.status === "rejected"
        ) {
          setError("Unable to load dashboard data. Please refresh.");
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">{error}</div>
    );
  }

  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.status !== "Completed").length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "Submitted"
  ).length;
  const assignmentProgress =
    assignments.length === 0
      ? 0
      : Math.round((completedAssignments / assignments.length) * 100);

  const stats = [
    {
      label: "Total Courses",
      value: String(totalCourses),
      icon: BookOpen,
      color: "from-indigo-600 to-blue-600",
    },
    {
      label: "Active Courses",
      value: String(activeCourses),
      icon: Award,
      color: "from-emerald-600 to-teal-600",
    },
    {
      label: "Assignments",
      value: String(assignments.length),
      icon: Clock,
      color: "from-violet-600 to-purple-600",
    },
    {
      label: "Completion",
      value: `${assignmentProgress}%`,
      icon: TrendingUp,
      color: "from-orange-600 to-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 flex-1">
              <Badge className="mb-4 bg-white/20 text-white border-0">
                Welcome Back!
              </Badge>
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.username ? `Hi, ${user.username}!` : "Student Learning"}
              </h1>
              <p className="text-white/90 mb-6">
                Continue your learning journey and achieve your goals
              </p>
              <Button className="bg-white text-indigo-600 hover:bg-white/90">
                Start Learning
              </Button>
            </div>
            <div className="w-full md:w-[360px] h-48 md:h-64 mr-4">
              <ImageWithFallback
                src={headerImage}
                alt="Student Learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
