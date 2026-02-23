import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  Edit,
  Trash2,
  X,
} from "lucide-react";

import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

import {
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  type Course,
} from "../../../services/courseService";

/* ================= COMPONENT ================= */
export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [form, setForm] = useState({
    title: "",
    instructor: "",
    duration: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= FILTER ================= */
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor.toLowerCase().includes(query.toLowerCase())
  );

  /* ================= CREATE / EDIT ================= */
  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", instructor: "", duration: "" });
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title,
      instructor: course.instructor,
      duration: course.duration,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.instructor || !form.duration) {
      setFormError("All fields required");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editing) {
        await updateCourse(editing.id, form);
      } else {
        await createCourse(form);
      }

      setModalOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete course?")) return;

    // optimistic
    setCourses((prev) => prev.filter((c) => c.id !== id));

    try {
      await deleteCourse(id);
    } catch {
      alert("Delete failed");
      await load();
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-gray-500">Manage courses</p>
        </div>

        <Button className="bg-purple-600" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* SEARCH */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              placeholder="Search courses..."
            />
          </div>
        </CardContent>
      </Card>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No courses found
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-600">
                        {course.instructor}
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-green-100 text-green-700">
                    {course.status || "active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="flex gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" /> {course.students || 0}
                  </div>

                  <div className="flex gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" /> {course.duration}
                  </div>

                  <div className="text-sm text-purple-600">
                    Rating: {course.rating || 4.5}
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <span className="text-sm text-gray-500">
                    Progress: {course.progress || 0}%
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(course)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">
                {editing ? "Edit Course" : "Create Course"}
              </h3>

              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                <X />
              </Button>
            </div>

            <input
              className="w-full border p-2 rounded"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Instructor"
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <Button
              className="w-full bg-purple-600"
              disabled={saving}
              onClick={handleSave}
            >
              {saving
                ? editing
                  ? "Saving..."
                  : "Creating..."
                : editing
                ? "Save Changes"
                : "Create"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
