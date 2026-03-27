// src/app/components/pages/student/Submissions.tsx

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Upload, File, X, Save, Send, CheckCircle, Clock, AlertCircle,
} from "lucide-react";

import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getAssignments, type Assignment } from "../../../services/assignmentService";
import {
  createSubmission,
  getSubmissions,
  type Submission,
} from "../../../services/submissionService";

/* ─── HELPERS ────────────────────────────────────────── */
const statusBadge = (status: string) => {
  switch (status) {
    case "graded":
      return <Badge className="bg-green-100 text-green-700">Graded</Badge>;
    case "submitted":
      return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
  }
};

const assignmentStatusColor = (s: string) => {
  switch (s) {
    case "Submitted": return "bg-green-100 text-green-700";
    case "In Progress": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── COMPONENT ──────────────────────────────────────── */
export function Submissions() {
  const { user } = useCurrentUser();

  /* Data */
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* Form fields */
  const [docTitle, setDocTitle] = useState("");
  const [description, setDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  /* Submission state */
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── LOAD DATA ────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [a, s] = await Promise.allSettled([
          getAssignments(),
          getSubmissions(),
        ]);

        if (a.status === "fulfilled") {
          const pending = a.value.filter((x) => x.status !== "Submitted");
          setAssignments(a.value);
          // Auto-select first pending assignment
          setSelectedAssignment(pending[0] ?? a.value[0] ?? null);
        } else {
          setLoadError("Failed to load assignments.");
        }

        if (s.status === "fulfilled") {
          setPastSubmissions(s.value);
        }
      } catch (err) {
        setLoadError("Failed to load data.");
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [user]);

  /* ─── FILE HANDLING ────────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ─── RESET FORM ───────────────────────────────────── */
  const resetForm = () => {
    setDocTitle("");
    setDescription("");
    setTextContent("");
    setUploadedFiles([]);
    setSubmitError("");
  };

  /* ─── BUILD FORM DATA ──────────────────────────────── */
  const buildFormData = (status: "draft" | "submitted") => {
    if (!selectedAssignment) return null;

    const fd = new FormData();
    fd.append("assignmentId", selectedAssignment._id);
    fd.append("title", docTitle.trim() || selectedAssignment.title);
    fd.append("description", description.trim());
    fd.append("text", textContent.trim());
    fd.append("status", status);

    for (const file of uploadedFiles) {
      fd.append("files", file);
    }

    return fd;
  };

  /* ─── SAVE DRAFT ───────────────────────────────────── */
  const handleSaveDraft = async () => {
    if (!selectedAssignment) return;
    setSaving(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      const fd = buildFormData("draft");
      if (!fd) return;
      await createSubmission(fd);
      setSuccessMsg("Draft saved successfully.");
      const updated = await getSubmissions();
      setPastSubmissions(updated);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── SUBMIT ───────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    if (!docTitle.trim() && !textContent.trim() && uploadedFiles.length === 0) {
      setSubmitError("Please add a title, some content, or at least one file before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      const fd = buildFormData("submitted");
      if (!fd) return;
      await createSubmission(fd);

      // Update assignment list status locally
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === selectedAssignment._id ? { ...a, status: "Submitted" } : a
        )
      );

      const updated = await getSubmissions();
      setPastSubmissions(updated);

      resetForm();
      setSuccessMsg(`"${selectedAssignment.title}" submitted successfully!`);

      // Move to next pending assignment
      const remaining = assignments.filter(
        (a) => a._id !== selectedAssignment._id && a.status !== "Submitted"
      );
      setSelectedAssignment(remaining[0] ?? null);
    } catch (err: any) {
      setSubmitError(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── RENDER ─────────────────────────────────────────*/
  if (loadingData) {
    return <div className="p-6 text-center text-gray-500">Loading submissions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* SUCCESS */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
          <button className="ml-auto" onClick={() => setSuccessMsg("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{loadError}</p>
        </div>
      )}

      {/* ASSIGNMENT SELECTOR */}
      {assignments.length > 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Select Assignment</h3>
            <div className="space-y-2">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  onClick={() => {
                    setSelectedAssignment(a);
                    resetForm();
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAssignment?._id === a._id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.course} · Due {a.dueDate}</p>
                  </div>
                  <Badge className={assignmentStatusColor(a.status)}>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ASSIGNMENT INFO */}
      {selectedAssignment && (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedAssignment.title}
                </h2>
                <p className="text-gray-600 text-sm">{selectedAssignment.course}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-semibold text-gray-900">
                  {selectedAssignment.dueDate}
                </p>
              </div>
            </div>

            {selectedAssignment.status === "Submitted" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  This assignment has already been submitted.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Please submit before the deadline.
                  Late submissions may incur a penalty.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SUBMISSION FORM — only shown for non-submitted assignments */}
      {selectedAssignment && selectedAssignment.status !== "Submitted" && (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Submit Your Work</h3>

            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="doc-title">Document Title</Label>
                <Input
                  id="doc-title"
                  placeholder={`e.g., ${selectedAssignment.title} - Final Version`}
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Briefly describe your submission..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Rich text area */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
                  {["B", "I", "U"].map((f) => (
                    <Button key={f} variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs font-bold">
                      {f}
                    </Button>
                  ))}
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Link</Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Code</Button>
                </div>
                <Textarea
                  placeholder="Type your submission content here..."
                  rows={8}
                  className="border-0 rounded-none resize-none focus-visible:ring-0"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label>Upload Files</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, ZIP, TXT, PNG, JPG (max 50 MB each)
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Files to upload ({uploadedFiles.length}):
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <File className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {submitError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={submitting || saving}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Submitting..." : "Submit Assignment"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleSaveDraft}
                  disabled={submitting || saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Draft"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PAST SUBMISSIONS */}
      {pastSubmissions.length > 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Submissions</h3>
            <div className="space-y-3">
              {pastSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    sub.status === "graded"
                      ? "bg-green-50 border-green-200"
                      : sub.status === "submitted"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        sub.status === "graded"
                          ? "bg-green-100"
                          : sub.status === "submitted"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {sub.status === "graded" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sub.title || sub.assignmentTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sub.course} ·{" "}
                        {new Date(sub.createdAt).toLocaleDateString()}
                        {sub.files.length > 0 && ` · ${sub.files.length} file(s)`}
                      </p>
                      {sub.feedback && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          Feedback: {sub.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.grade && (
                      <span className="text-sm font-semibold text-green-700">
                        {sub.grade}
                      </span>
                    )}
                    {statusBadge(sub.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingData && assignments.length === 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No assignments found yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
