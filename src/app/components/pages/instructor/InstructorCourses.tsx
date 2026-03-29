import { useEffect, useState, useCallback } from "react";
import { Plus, Search, BookOpen, Users, Clock, Edit, Trash2, X, Star } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  getCourses, createCourse, deleteCourse, updateCourse, type Course,
} from "../../../services/courseService";
import { getCourseContents } from "../../../services/contentService";

export function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: "", duration: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data || []);
    } catch {
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", duration: "", description: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({ title: course.title, duration: course.duration, description: "" });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(""); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.duration.trim()) {
      setFormError("Title and duration are required");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await updateCourse(editing._id, form);
      } else {
        await createCourse({ title: form.title, instructor: "", duration: form.duration });
      }
      closeModal();
      await load();
    } catch {
      setFormError("Save failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    setCourses((prev) => prev.filter((c) => c._id !== id));
    try { await deleteCourse(id); } catch { await load(); }
  };

  const openLessons = async (course: Course) => {
    setSelectedCourse(course);
    try {
      setLessonLoading(true);
      const data = await getCourseContents(course._id);
      setLessons(data || []);
    } catch {
      setLessons([]);
    } finally {
      setLessonLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">My Courses</h1>
          <p className="text-gray-500">Manage your courses and content</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
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
              placeholder="Search your courses..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Courses", value: courses.length, color: "text-indigo-600" },
          { label: "Active", value: courses.filter((c) => c.status === "active").length, color: "text-green-600" },
          { label: "Total Students", value: courses.reduce((s, c) => s + (c.students || 0), 0), color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <BookOpen className="w-12 h-12 mx-auto mb-3" />
          <p>No courses found. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((course) => (
            <Card key={course._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.duration}</p>
                    </div>
                  </div>
                  <Badge className={course.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                    {course.status || "active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students ?? 0} students
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    {course.rating ?? 4.5}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => openLessons(course)}>
                    View Content
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(course)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(course._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{editing ? "Edit Course" : "Create Course"}</h3>
              <Button variant="ghost" size="icon" onClick={closeModal}><X /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Course Title *</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g., Advanced React Patterns"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Duration *</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g., 8 weeks"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Panel */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">{selectedCourse.title} — Content</h3>
              <Button variant="ghost" onClick={() => setSelectedCourse(null)}><X /></Button>
            </div>
            {lessonLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : lessons.length === 0 ? (
              <p className="text-gray-400">No content yet. Upload content from the Content Library page.</p>
            ) : (
              lessons.map((l) => (
                <div key={l._id} className="border rounded-lg p-3 mb-2">
                  <p className="font-medium">{l.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{l.type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
