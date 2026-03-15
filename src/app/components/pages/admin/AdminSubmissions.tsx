import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { getSubmissions } from "../../../services/adminService";

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
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const data = await getSubmissions();
        setSubmissions(data ?? []);
      } catch {
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading submissions...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const pending = submissions.filter((s) => s.status === "pending").length;
  const graded = submissions.filter((s) => s.status === "graded").length;

  const stats = [
    { label: "Pending", value: pending, icon: Clock },
    { label: "Graded", value: graded, icon: CheckCircle },
    { label: "Late", value: 0, icon: AlertCircle },
    { label: "Total", value: submissions.length, icon: Upload },
  ];

  const getBadge = (status: SubmissionStatus) =>
    status === "pending" ? (
      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-700">Graded</Badge>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Submissions Review</h1>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <Card key={s.label}>
              <CardContent className="p-6">
                <Icon className="w-6 h-6 mb-3 text-indigo-600" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-600">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No submissions available
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Student</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Course</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Grade</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500">Action</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-6 py-4">{s.student}</td>
                    <td className="px-6 py-4">{s.course}</td>
                    <td className="px-6 py-4">{s.assignment}</td>
                    <td className="px-6 py-4">{s.submittedAt}</td>
                    <td className="px-6 py-4">{getBadge(s.status)}</td>
                    <td className="px-6 py-4">{s.grade || "-"}</td>
                    <td className="px-6 py-4">
                      <Button size="sm">Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}