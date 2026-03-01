import { useEffect, useState } from "react";
import { Calendar, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

import { useCurrentUser } from "../../../hooks/useCurrentUser";
import {
  getAssignments,
  updateAssignmentStatus,
  type Assignment,
  type AssignmentStatus,
} from "../../../services/assignmentService";

export function Assignments() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    getAssignments()
      .then(setItems)
      .catch((err) => {
        console.error("Failed to load assignments:", err);
        setError("Unable to load assignments.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatus = async (id: string, status: AssignmentStatus) => {
    try {
      setUpdatingId(id);
      await updateAssignmentStatus(id, { status });
      setItems((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error("Failed to update assignment:", err);
      setError("Unable to update assignment.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading assignments...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {error || "No assignments yet."}
      </div>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "Submitted":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Not Started":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((a) => (
              <div
                key={a._id}
                className="p-6 flex justify-between items-start"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {a.dueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {a.type}
                      </span>
                      <span>{a.course}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={statusColor(a.status)}>
                    {a.status}
                  </Badge>

                  {a.status === "Not Started" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatus(a._id, "In Progress")}
                      disabled={updatingId === a._id}
                    >
                      Start
                    </Button>
                  )}

                  {a.status === "In Progress" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatus(a._id, "Submitted")}
                      disabled={updatingId === a._id}
                    >
                      Submit
                    </Button>
                  )}

                  {a.status === "Submitted" && (
                    <Button size="sm" variant="outline" disabled>
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
