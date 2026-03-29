// AdminCourses.tsx — Full implementation
import { useEffect, useState, useCallback } from "react";
import { Plus, Search, BookOpen, Users, Clock, Edit, Trash2, X, Layers, Star } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { getCourses, createCourse, deleteCourse, updateCourse, type Course } from "../../../services/courseService";
import { getCourseContents } from "../../../services/contentService";

export function AdminCourses() {
  const [courses,       setCourses]       = useState<Course[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [query,         setQuery]         = useState("");
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editing,       setEditing]       = useState<Course | null>(null);
  const [form,          setForm]          = useState({ title: "", instructor: "", duration: "" });
  const [saving,        setSaving]        = useState(false);
  const [formError,     setFormError]     = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons,       setLessons]       = useState<any[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);

  const loadCourses = useCallback(async () => {
    try { setLoading(true); setCourses(await getCourses() || []); }
    catch { alert("Failed to load courses"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const openLessons = async (course: Course) => {
    setSelectedCourse(course);
    try { setLessonLoading(true); setLessons(await getCourseContents(course._id) || []); }
    catch { setLessons([]); }
    finally { setLessonLoading(false); }
  };

  const filtered = courses.filter((c) => c.title?.toLowerCase().includes(query.toLowerCase()) || c.instructor?.toLowerCase().includes(query.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm({ title: "", instructor: "", duration: "" }); setFormError(""); setModalOpen(true); };
  const openEdit   = (c: Course) => { setEditing(c); setForm({ title: c.title, instructor: c.instructor, duration: c.duration }); setFormError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(""); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.duration.trim()) { setFormError("Title and duration are required"); return; }
    try {
      setSaving(true);
      if (editing) await updateCourse(editing._id, form); else await createCourse(form);
      closeModal(); await loadCourses();
    } catch { setFormError("Save failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    setCourses((prev) => prev.filter((c) => c._id !== id));
    try { await deleteCourse(id); } catch { await loadCourses(); }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-semibold">Course Management</h1><p className="text-gray-500">Manage all platform courses</p></div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Course</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[["Total", courses.length],["Active", courses.filter((c)=>c.status==="active").length],["Students", courses.reduce((s,c)=>s+(c.students||0),0)]].map(([l,v]) => (
          <Card key={l as string}><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{v as number}</p><p className="text-sm text-gray-500">{l as string}</p></CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search courses..." /></div></CardContent></Card>

      {filtered.length === 0 ? <div className="text-center text-gray-400 py-12">No courses found.</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((course) => (
            <Card key={course._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-purple-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">{course.title}</h3><p className="text-sm text-gray-500">{course.instructor || "—"}</p></div>
                  </div>
                  <Badge className="capitalize text-xs h-fit">{course.status || "active"}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.students ?? 0}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                  <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-current" />{course.rating ?? 4.5}</span>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => openLessons(course)}><Layers className="w-4 h-4 mr-1" />Lessons</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(course)}><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(course._id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-lg">{editing ? "Edit Course" : "New Course"}</h3><Button variant="ghost" size="icon" onClick={closeModal}><X /></Button></div>
            <div className="space-y-3">
              {(["title","instructor","duration"] as const).map((field) => (
                <div key={field}><label className="text-sm font-medium text-gray-700 block mb-1 capitalize">{field}</label>
                  <Input placeholder={field === "title" ? "e.g., React Fundamentals" : field === "instructor" ? "e.g., Dr. Smith" : "e.g., 6 weeks"} value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
            <div className="flex justify-end gap-2 mt-5"><Button variant="ghost" onClick={closeModal}>Cancel</Button><Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button></div>
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[580px] max-h-[75vh] overflow-y-auto p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between mb-4"><h3 className="font-semibold">{selectedCourse.title} — Lessons</h3><Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)}><X /></Button></div>
            {lessonLoading ? <p className="text-gray-400">Loading...</p> : lessons.length === 0 ? <p className="text-gray-400">No lessons. Upload content from the Content page.</p> : lessons.map((l) => (
              <div key={l._id} className="border rounded-lg p-3 mb-2"><p className="font-medium text-sm">{l.title}</p><p className="text-xs text-gray-400 capitalize">{l.type}</p></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}