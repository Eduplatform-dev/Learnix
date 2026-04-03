import { useEffect, useState, useCallback } from "react";
import { Search, BookOpen, Users, Clock, Trash2, Star, Archive, ArchiveRestore, Layers, X } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { getCourses, deleteCourse, updateCourse, type Course } from "../../../services/courseService";
import { getCourseContents } from "../../../services/contentService";

export function AdminCourses() {
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [query,          setQuery]          = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons,        setLessons]        = useState<any[]>([]);
  const [lessonLoading,  setLessonLoading]  = useState(false);
  const [archiving,      setArchiving]      = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    try { setLoading(true); setCourses(await getCourses() || []); }
    catch { alert("Failed to load courses"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const openLessons = async (course: Course) => {
    setSelectedCourse(course);
    try {
      setLessonLoading(true);
      setLessons(await getCourseContents(course._id) || []);
    } catch { setLessons([]); }
    finally { setLessonLoading(false); }
  };

  const handleArchive = async (course: Course) => {
    const newStatus = course.status === "archived" ? "active" : "archived";
    setArchiving(course._id);
    try {
      await updateCourse(course._id, { status: newStatus });
      await loadCourses();
    } catch { alert("Failed to update course status."); }
    finally { setArchiving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this course? This cannot be undone.")) return;
    setCourses((prev) => prev.filter((c) => c._id !== id));
    try { await deleteCourse(id); } catch { await loadCourses(); }
  };

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(query.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(query.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "active")   return "bg-green-100 text-green-700";
    if (status === "archived") return "bg-gray-100 text-gray-500";
    return "bg-blue-100 text-blue-700";
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header — no "New Course" button, admin moderates only */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-gray-500">
            Oversee all platform courses — archive or remove as needed.
            Instructors create and manage course content.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Total",    courses.length],
          ["Active",   courses.filter((c) => c.status === "active").length],
          ["Archived", courses.filter((c) => c.status === "archived").length],
        ].map(([l, v]) => (
          <Card key={l as string}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{v as number}</p>
              <p className="text-sm text-gray-500">{l as string}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              placeholder="Search by course title or instructor..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No courses found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((course) => (
            <Card
              key={course._id}
              className={`hover:shadow-md transition-shadow ${course.status === "archived" ? "opacity-60" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.instructor || "—"}</p>
                    </div>
                  </div>
                  <Badge className={`capitalize text-xs h-fit ${statusColor(course.status)}`}>
                    {course.status || "active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students ?? 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {course.rating ?? 4.5}
                  </span>
                </div>

                {/* Admin actions: view lessons, archive, delete — NO edit/create */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => openLessons(course)}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    View Lessons
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={`text-xs ${course.status === "archived" ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}`}
                    onClick={() => handleArchive(course)}
                    disabled={archiving === course._id}
                  >
                    {archiving === course._id ? (
                      "..."
                    ) : course.status === "archived" ? (
                      <><ArchiveRestore className="w-4 h-4 mr-1" />Restore</>
                    ) : (
                      <><Archive className="w-4 h-4 mr-1" />Archive</>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(course._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lessons Preview Modal — read only for admin */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[580px] max-h-[75vh] overflow-y-auto p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold">{selectedCourse.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Instructor: {selectedCourse.instructor || "—"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)}>
                <X />
              </Button>
            </div>
            {lessonLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : lessons.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No lessons yet. Instructors add lessons from their dashboard.
              </p>
            ) : (
              <div className="space-y-2">
                {lessons.map((l) => (
                  <div key={l._id} className="border rounded-lg p-3">
                    <p className="font-medium text-sm">{l.title}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{l.type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}