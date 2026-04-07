import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import {
  CheckCircle, AlertTriangle, Users, Save, BarChart3,
  BookOpen, Calendar, Clock,
} from "lucide-react";
import {
  markAttendance, getCourseReport,
  type AttendanceRecord, type AttendanceStatus, type CourseReport,
} from "../../../services/attendanceService";
import { getCourses } from "../../../services/courseService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-600 text-white border-green-600",
  absent:  "bg-red-500 text-white border-red-500",
  late:    "bg-amber-500 text-white border-amber-500",
  excused: "bg-blue-400 text-white border-blue-400",
};

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

type EnrolledStudent = {
  _id:      string;
  username: string;
  email:    string;
};

type CourseWithStudents = {
  _id:              string;
  title:            string;
  enrolledStudents: EnrolledStudent[];
};

export function InstructorAttendance() {
  const [courses,        setCourses]        = useState<CourseWithStudents[]>([]);
  const [selected,       setSelected]       = useState<CourseWithStudents | null>(null);
  const [view,           setView]           = useState<"mark" | "report">("mark");
  const [date,           setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [topic,          setTopic]          = useState("");
  const [lectureType,    setLectureType]    = useState("lecture");
  const [records,        setRecords]        = useState<AttendanceRecord[]>([]);
  const [report,         setReport]         = useState<CourseReport | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [loadingReport,  setLoadingReport]  = useState(false);
  const [loadingStudents,setLoadingStudents]= useState(false);

  // FIX: getCourses() strips enrolledStudents to just a count.
  // We fetch each course individually via /api/courses/:id which returns
  // the populated enrolledStudents array with username/email.
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        // Get list of instructor's courses first
        const listRes = await fetch(`${API_BASE_URL}/api/courses?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listData = await listRes.json();
        const courseList: any[] = Array.isArray(listData)
          ? listData
          : listData.courses ?? [];

        // Fetch each course individually to get populated enrolledStudents
        const detailed = await Promise.all(
          courseList.map(async (c: any) => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/courses/${c._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const full = await res.json();
              return {
                _id:   full._id,
                title: full.title,
                // enrolledStudents comes back as populated objects with _id, username, email
                enrolledStudents: Array.isArray(full.enrolledStudents)
                  ? full.enrolledStudents.map((s: any) =>
                      typeof s === "object"
                        ? { _id: s._id, username: s.username || s.email || "Student", email: s.email || "" }
                        : { _id: s, username: "Student", email: "" }
                    )
                  : [],
              } as CourseWithStudents;
            } catch {
              return { _id: c._id, title: c.title, enrolledStudents: [] } as CourseWithStudents;
            }
          })
        );

        setCourses(detailed);
        if (detailed.length > 0) {
          setSelected(detailed[0]);
        }
      } catch (err) {
        console.error("InstructorAttendance load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When a course is selected, initialise attendance records for all enrolled students
  useEffect(() => {
    if (!selected) return;
    setRecords(
      selected.enrolledStudents.map((s) => ({
        student: s._id,
        status:  "present" as AttendanceStatus,
      }))
    );
  }, [selected]);

  const loadReport = useCallback(async () => {
    if (!selected) return;
    setLoadingReport(true);
    try {
      const data = await getCourseReport(selected._id);
      setReport(data);
    } catch (e) { console.error(e); }
    finally { setLoadingReport(false); }
  }, [selected]);

  useEffect(() => {
    if (view === "report") loadReport();
  }, [view, loadReport]);

  const toggleStatus = (studentId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.student !== studentId) return r;
        const idx = STATUSES.indexOf(r.status);
        return { ...r, status: STATUSES[(idx + 1) % STATUSES.length] };
      })
    );
  };

  const setAll = (status: AttendanceStatus) =>
    setRecords((prev) => prev.map((r) => ({ ...r, status })));

  const handleSave = async () => {
    if (!selected || records.length === 0) return;
    setSaving(true);
    try {
      await markAttendance({ courseId: selected._id, date, records, lectureType, topic });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper: get display name for a student ID
  const studentName = (studentId: string): string => {
    const s = selected?.enrolledStudents.find((e) => e._id === studentId);
    return s ? (s.username || s.email || "Student") : `Student (${studentId.slice(-4)})`;
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount  = records.filter((r) => r.status === "absent").length;

  if (loading) return (
    <div className="flex items-center justify-center p-16">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (courses.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No courses assigned to you yet.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-gray-500">Mark and track student attendance</p>
      </div>

      {/* Course selector + tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 flex-1"
          value={selected?._id || ""}
          onChange={(e) => {
            const c = courses.find((x) => x._id === e.target.value);
            setSelected(c || null);
            setView("mark");
            setReport(null);
          }}
        >
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title} ({c.enrolledStudents.length} students)
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "mark" ? "default" : "outline"}
            onClick={() => setView("mark")}
            className="gap-1"
          >
            <Users className="w-4 h-4" />Mark
          </Button>
          <Button
            size="sm"
            variant={view === "report" ? "default" : "outline"}
            onClick={() => setView("report")}
            className="gap-1"
          >
            <BarChart3 className="w-4 h-4" />Report
          </Button>
        </div>
      </div>

      {/* MARK ATTENDANCE VIEW */}
      {view === "mark" && selected && (
        <>
          {/* Session info */}
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label>Lecture Type</Label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    value={lectureType}
                    onChange={(e) => setLectureType(e.target.value)}
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
                <div>
                  <Label>Topic (optional)</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g., Arrays and Pointers"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats + bulk actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
              ✓ {presentCount} Present
            </Badge>
            <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1">
              ✗ {absentCount} Absent
            </Badge>
            <Badge className="bg-amber-100 text-amber-700 text-sm px-3 py-1">
              ~ {records.filter((r) => r.status === "late").length} Late
            </Badge>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setAll("present")}>All Present</Button>
              <Button size="sm" variant="outline" onClick={() => setAll("absent")}>All Absent</Button>
            </div>
          </div>

          {/* Student list */}
          {records.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No enrolled students in this course.</p>
              <p className="text-xs mt-1">Students must enroll in the course before attendance can be marked.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record, idx) => {
                const style = STATUS_STYLES[record.status];
                const name  = studentName(record.student);
                return (
                  <div
                    key={record.student}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{name}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {selected.enrolledStudents.find((s) => s._id === record.student)?.email || ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStatus(record.student)}
                      className={`px-4 py-1.5 rounded-full border-2 text-xs font-bold capitalize transition-all ${style}`}
                    >
                      {record.status}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Save button */}
          {saved ? (
            <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl py-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Attendance saved successfully!</span>
            </div>
          ) : (
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 h-11"
              onClick={handleSave}
              disabled={saving || records.length === 0}
            >
              <Save className="w-4 h-4" />
              {saving
                ? "Saving..."
                : `Save Attendance — ${new Date(date).toLocaleDateString("en-IN")} (${records.length} students)`}
            </Button>
          )}
        </>
      )}

      {/* REPORT VIEW */}
      {view === "report" && (
        <>
          {loadingReport ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : report ? (
            <>
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-100 text-indigo-700">{report.totalSessions} sessions</Badge>
                <Badge className="bg-red-100 text-red-700">
                  {report.students.filter((s) => s.shortage).length} shortage
                </Badge>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {["Student", "Present", "Absent", "Late", "%", "Status"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[...report.students]
                          .sort((a, b) => a.percentage - b.percentage)
                          .map((s) => (
                            <tr key={s.student._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">{s.student.username}</p>
                                <p className="text-xs text-gray-400">{s.student.email}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-green-700 font-medium">{s.present}</td>
                              <td className="px-4 py-3 text-sm text-red-600 font-medium">{s.absent}</td>
                              <td className="px-4 py-3 text-sm text-amber-600 font-medium">{s.late}</td>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-bold ${
                                  s.percentage >= 85 ? "text-green-600" :
                                  s.percentage >= 75 ? "text-amber-600" : "text-red-600"
                                }`}>{s.percentage}%</span>
                              </td>
                              <td className="px-4 py-3">
                                {s.shortage ? (
                                  <Badge className="bg-red-100 text-red-700 text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />Shortage
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />OK
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              No report data available for this course yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}