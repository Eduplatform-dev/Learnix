import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../ui/button";

type SubmissionStatus = "pending" | "graded";

type Submission = {
  id: string;
  student: string;
  course: string;
  assignment: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade: string | null;
};

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Later: replace with Firestore fetch
    try {
      // TEMP: empty list (real app-ready)
      setSubmissions([]);
    } catch {
      setError("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading submissions...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  const stats = [
    { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { label: "Graded", value: gradedCount, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    { label: "Late Submissions", value: 0, icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-100" },
    { label: "Total", value: submissions.length, icon: Upload, color: "text-blue-600", bgColor: "bg-blue-100" },
  ];

  const getStatusBadge = (status: SubmissionStatus) => {
    if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700">Graded</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Submissions Review</h1>
        <p className="text-gray-600 mt-1">Review and grade student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No submissions available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.student}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.course}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.assignment}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.submittedAt}</td>
                      <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.grade || "-"}</td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log("Review submission:", s.id);
                          }}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
