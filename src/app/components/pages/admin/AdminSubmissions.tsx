// src/app/components/pages/admin/AdminSubmissions.tsx

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Upload, Clock, CheckCircle, AlertCircle, X, FileText, Download,
} from "lucide-react";
import {
  getSubmissions,
  gradeSubmission,
  type Submission,
} from "../../../services/submissionService";

/* ─── HELPERS ─────────────────────────────────────────── */
const statusBadge = (status: string) => {
  switch (status) {
    case "graded":
      return <Badge className="bg-green-100 text-green-700">Graded</Badge>;
    case "submitted":
      return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600">Draft</Badge>;
  }
};

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── COMPONENT ───────────────────────────────────────── */
export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Grading modal */
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  /* Filter */
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "graded" | "draft">("all");
  const [search, setSearch] = useState("");

  /* ─── LOAD ─────────────────────────────────────────── */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ─── GRADE ────────────────────────────────────────── */
  const openGradeModal = (sub: Submission) => {
    setGradingId(sub._id);
    setGrade(sub.grade || "");
    setFeedback(sub.feedback || "");
    setGradeError("");
  };

  const handleGrade = async () => {
    if (!gradingId || !grade.trim()) {
      setGradeError("Please enter a grade.");
      return;
    }
    try {
      setGrading(true);
      const updated = await gradeSubmission(gradingId, {
        grade: grade.trim(),
        feedback: feedback.trim(),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      setGradingId(null);
    } catch (err: any) {
      setGradeError(err?.message || "Failed to save grade.");
    } finally {
      setGrading(false);
    }
  };

  /* ─── FILTER ───────────────────────────────────────── */
  const filtered = submissions.filter((s) => {
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchSearch =
      !search ||
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  /* ─── STATS ────────────────────────────────────────── */
  const pending = submissions.filter((s) => s.status === "submitted").length;
  const graded = submissions.filter((s) => s.status === "graded").length;
  const drafts = submissions.filter((s) => s.status === "draft").length;
  const total = submissions.length;

  const stats = [
    { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Graded", value: graded, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Drafts", value: drafts, icon: FileText, color: "text-gray-600", bg: "bg-gray-100" },
    { label: "Total", value: total, icon: Upload, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  /* ─── RENDER ───────────────────────────────────────── */
  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading submissions...</div>;
  }

  if (error) {
    return (
      <div className="p-6 flex items-center gap-2 text-red-500">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Submissions Review</h1>
        <p className="text-gray-600 mt-1">Review and grade student submissions</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                setFilterStatus(
                  s.label === "Pending Review" ? "submitted"
                  : s.label === "Graded" ? "graded"
                  : s.label === "Drafts" ? "draft"
                  : "all"
                )
              }
            >
              <CardContent className="p-6">
                <div className={`${s.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-600 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by student, assignment, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              {(["all", "submitted", "graded", "draft"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filterStatus === s ? "default" : "outline"}
                  onClick={() => setFilterStatus(s)}
                  className="capitalize"
                >
                  {s === "submitted" ? "Pending" : s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {search || filterStatus !== "all"
                  ? "No submissions match your filter."
                  : "No submissions yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Student", "Assignment", "Course", "Submitted", "Files", "Status", "Grade", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {sub.studentName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-[180px]">
                        <p className="truncate" title={sub.assignmentTitle}>
                          {sub.assignmentTitle}
                        </p>
                        {sub.title && sub.title !== sub.assignmentTitle && (
                          <p className="text-xs text-gray-400 truncate">{sub.title}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{sub.course}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {sub.files.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {sub.files.map((f, i) => (
                              <a
                                key={i}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-indigo-600 hover:underline text-xs"
                              >
                                <Download className="w-3 h-3" />
                                {f.originalName.length > 20
                                  ? f.originalName.slice(0, 18) + "…"
                                  : f.originalName}
                                <span className="text-gray-400">({formatSize(f.size)})</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No files</span>
                        )}
                      </td>
                      <td className="px-4 py-4">{statusBadge(sub.status)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {sub.grade || "—"}
                      </td>
                      <td className="px-4 py-4">
                        {sub.status !== "draft" && (
                          <Button
                            size="sm"
                            variant={sub.status === "graded" ? "outline" : "default"}
                            onClick={() => openGradeModal(sub)}
                          >
                            {sub.status === "graded" ? "Edit Grade" : "Grade"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRADE MODAL */}
      {gradingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Grade Submission</h3>
              <Button variant="ghost" size="icon" onClick={() => setGradingId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Grade <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder='e.g., "85/100" or "A" or "Pass"'
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Feedback (optional)
                </label>
                <Textarea
                  placeholder="Leave feedback for the student..."
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>

            {gradeError && (
              <p className="text-red-500 text-sm mt-3">{gradeError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => setGradingId(null)}>
                Cancel
              </Button>
              <Button onClick={handleGrade} disabled={grading}>
                {grading ? "Saving..." : "Save Grade"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
