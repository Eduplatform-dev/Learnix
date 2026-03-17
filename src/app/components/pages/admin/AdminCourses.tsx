// src/app/components/pages/admin/AdminCourses.tsx

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Search, BookOpen, Users, Clock, Edit, Trash2, X, Layers,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  getCourses, createCourse, deleteCourse, updateCourse, type Course,
} from "../../../services/courseService";
import { getCourseContents } from "../../../services/contentService";

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: "", instructor: "", duration: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  /* Lessons panel */
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);

  /* ================= LOAD ================= */
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

  useEffect(() => { loadCourses(); }, [loadCourses]);

  /* ================= LESSONS ================= */
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

  /* ================= FILTER ================= */
  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(query.toLowerCase())
  );

  /* ================= OPEN MODAL ================= */
  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", instructor: "", duration: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({ title: course.title, instructor: course.instructor, duration: course.duration });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormError("");
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.title.trim() || !form.instructor.trim() || !form.duration.trim()) {
      setFormError("All fields are required");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await updateCourse(editing._id, form);
      } else {
        await createCourse(form);
      }
      closeModal();
      await loadCourses();
    } catch {
      setFormError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
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
          <p className="text-gray-500">Manage courses &amp; lessons</p>
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

      {/* COURSE CARDS */}
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
                    <p className="text-sm text-gray-600">{course.instructor}</p>
                  </div>
                </div>
                <Badge>{course.status || "active"}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="flex gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" /> {course.students || 0}
                </div>
                <div className="flex gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" /> {course.duration}
                </div>
                <div className="text-sm text-purple-600">
                  ★ {course.rating || 4.5}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button size="sm" variant="ghost" onClick={() => openLessons(course)}>
                  <Layers className="w-4 h-4 mr-1" /> Lessons
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

      {/* ================= CREATE / EDIT MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {editing ? "Edit Course" : "New Course"}
              </h3>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Course Title
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., React Fundamentals"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Instructor
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Dr. Smith"
                  value={form.instructor}
                  onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Duration
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 6 weeks"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
            </div>

            {formError && (
              <p className="text-red-500 text-sm mt-2">{formError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LESSONS PANEL ================= */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[650px] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">
                {selectedCourse.title} — Lessons
              </h3>
              <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                <X />
              </Button>
            </div>

            {lessonLoading ? (
              <p className="text-gray-500">Loading lessons...</p>
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
