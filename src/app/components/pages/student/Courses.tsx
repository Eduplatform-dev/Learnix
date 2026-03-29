import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Clock, Users, Star, Search, Filter, BookOpen } from "lucide-react";
import { ImageWithFallback } from "../ImageWithFallback";
import { getCourses, enrollInCourse, type Course } from "../../../services/courseService";

const statusColor: Record<string, string> = {
  "In Progress": "bg-blue-500",
  "Completed":   "bg-green-500",
  "Not Started": "bg-gray-400",
  active:        "bg-blue-500",
  archived:      "bg-gray-400",
  completed:     "bg-green-500",
};

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (id: string) => {
    try {
      setEnrolling(id);
      await enrollInCourse(id);
      setCourses((prev) =>
        prev.map((c) => c._id === id ? { ...c, status: "In Progress" as any } : c)
      );
    } catch (err: any) {
      alert(err?.message || "Enrollment failed");
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses.filter((c) =>
    (c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-10 bg-white border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Enrolled",    value: courses.length },
          { label: "In Progress", value: courses.filter((c) => c.status !== "Completed" && c.status !== "completed").length },
          { label: "Completed",   value: courses.filter((c) => c.status === "Completed" || c.status === "completed").length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filtered.map((course) => (
            <Card key={course._id} className="border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {/* Thumbnail */}
              <div className="relative h-44 bg-gradient-to-br from-indigo-100 to-purple-100">
                {course.image ? (
                  <ImageWithFallback
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
                <Badge className={`absolute top-3 right-3 text-white text-xs ${statusColor[course.status] || "bg-gray-400"}`}>
                  {course.status === "active" ? "Active" : course.status}
                </Badge>
              </div>

              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.students}</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {course.rating}
                  </span>
                </div>

                {course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-auto"
                  variant={course.status === "Completed" || course.status === "completed" ? "outline" : "default"}
                  disabled={enrolling === course._id}
                  onClick={() => {
                    if (course.status === "Not Started") handleEnroll(course._id);
                  }}
                >
                  {enrolling === course._id
                    ? "Enrolling..."
                    : course.status === "Completed" || course.status === "completed"
                    ? "Review Course"
                    : course.status === "In Progress" || course.status === "active"
                    ? "Continue Learning"
                    : "Enroll Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}