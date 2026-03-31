import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, Users, Star, Search, BookOpen, PlayCircle,
  CheckCircle, Lock, Zap, TrendingUp, Award,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { getCourses, enrollInCourse, type Course } from "../../../services/courseService";
import { getCourseProgress } from "../../../services/lessonService";

type CourseWithProgress = Course & {
  progressPercent: number;
  lessonCount: number;
};

export function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "enrolled" | "completed">("all");

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await getCourses();
        // Fetch progress for each enrolled course
        const enriched = await Promise.all(
          raw.map(async (c) => {
            try {
              const prog = await getCourseProgress(c._id);
              return { ...c, progressPercent: prog.percent, lessonCount: prog.total };
            } catch {
              return { ...c, progressPercent: 0, lessonCount: 0 };
            }
          })
        );
        setCourses(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      setCourses(prev =>
        prev.map(c =>
          c._id === courseId ? { ...c, status: "active" as any } : c
        )
      );
    } catch (err: any) {
      alert(err?.message || "Enrollment failed");
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (c: CourseWithProgress) =>
    c.status === "active" || c.status === "In Progress" || c.status === "Completed";

  const isCompleted = (c: CourseWithProgress) =>
    c.progressPercent === 100 || c.status === "Completed";

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    if (filter === "enrolled") return matchSearch && isEnrolled(c);
    if (filter === "completed") return matchSearch && isCompleted(c);
    return matchSearch;
  });

  const stats = {
    total: courses.length,
    enrolled: courses.filter(isEnrolled).length,
    completed: courses.filter(isCompleted).length,
    avgProgress: courses.length
      ? Math.round(courses.reduce((s, c) => s + c.progressPercent, 0) / courses.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500 mt-1">Continue learning where you left off</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: stats.total, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Enrolled", value: stats.enrolled, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: stats.completed, icon: Award, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg Progress", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses or instructors..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "enrolled", "completed"] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No courses found.</p>
          {search && <p className="text-sm mt-1">Try a different search term.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(course => {
            const enrolled = isEnrolled(course);
            const completed = isCompleted(course);

            return (
              <Card
                key={course._id}
                className="border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : null}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {completed ? (
                      <Badge className="bg-green-500 text-white border-0 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : enrolled ? (
                      <Badge className="bg-blue-500 text-white border-0 text-xs">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Enrolled
                      </Badge>
                    ) : (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Not enrolled
                      </Badge>
                    )}
                  </div>

                  {/* Lesson count */}
                  {course.lessonCount > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Progress bar on image */}
                  {enrolled && course.progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-green-400 transition-all"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{course.instructor || "—"}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.students} students
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {course.rating}
                    </span>
                  </div>

                  {/* Progress */}
                  {enrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium text-gray-700">{course.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            completed ? "bg-green-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="mt-auto">
                    {enrolled ? (
                      <Button
                        className="w-full"
                        variant={completed ? "outline" : "default"}
                        onClick={() => navigate(`/dashboard/courses/${course._id}`)}
                      >
                        {completed ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review Course
                          </>
                        ) : course.progressPercent > 0 ? (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Continue Learning
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Course
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={enrolling === course._id}
                        onClick={() => handleEnroll(course._id)}
                      >
                        {enrolling === course._id ? "Enrolling..." : "Enroll Now — Free"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}