import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  Edit,
  Trash2,
  X,
  Layers,
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

import { getCourseContents } from "../../../services/contentService";

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    instructor: "",
    duration: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  /* LOAD COURSES */
  const loadCourses = useCallback(async () => {
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

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  /* LOAD LESSONS */
  const openLessons = async (course: Course) => {
    setSelectedCourse(course);
    try {
      setLessonLoading(true);
      const data = await getCourseContents(course._id);
      setLessons(data || []);
    } finally {
      setLessonLoading(false);
    }
  };

  /* FILTER */
  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(query.toLowerCase())
  );

  /* CREATE */
  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", instructor: "", duration: "" });
    setModalOpen(true);
  };

  /* EDIT */
  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title,
      instructor: course.instructor,
      duration: course.duration,
    });
    setModalOpen(true);
  };

  /* SAVE */
  const handleSave = async () => {
    if (!form.title || !form.instructor || !form.duration) {
      setFormError("All fields required");
      return;
    }

    try {
      setSaving(true);

      if (editing) {
        await updateCourse(editing._id, form);
      } else {
        await createCourse(form);
      }

      setModalOpen(false);
      await loadCourses();
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete course?")) return;

    setCourses((prev) => prev.filter((c) => c._id !== id));

    try {
      await deleteCourse(id);
    } catch {
      alert("Delete failed");
      await loadCourses();
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-gray-500">
            Manage courses & lessons
          </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((course) => (
          <Card key={course._id}>
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

                <Badge>{course.status || "active"}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="flex gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {course.students || 0}
                </div>

                <div className="flex gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </div>

                <div className="text-sm text-purple-600">
                  Rating {course.rating || 4.5}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openLessons(course)}
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Lessons
                </Button>

                <Button size="sm" variant="ghost" onClick={() => openEdit(course)}>
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => handleDelete(course._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* LESSON PANEL */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[650px] p-6 rounded-xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">
                {selectedCourse.title} — Lessons
              </h3>

              <Button
                variant="ghost"
                onClick={() => setSelectedCourse(null)}
              >
                <X />
              </Button>
            </div>

            {lessonLoading ? (
              <p>Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <p className="text-gray-500">No lessons yet.</p>
            ) : (
              lessons.map((l) => (
                <div key={l._id} className="border p-3 rounded mb-2">
                  <p className="font-medium">{l.title}</p>
                  <p className="text-xs text-gray-500">{l.type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}