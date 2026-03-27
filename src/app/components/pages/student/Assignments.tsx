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

  useEffect(() => {
    if (!user) return;

    getAssignments()
      .then((data) => setItems(data || []))
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatus = async (id: string, status: AssignmentStatus) => {
    await updateAssignmentStatus(id, { status });

    setItems((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status } : a))
    );
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {items.map((a) => (
          <div key={a._id} className="p-6 flex justify-between">
            <div>
              <h3 className="font-semibold">{a.title}</h3>

              <div className="text-sm text-gray-500 flex gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(a.dueDate).toLocaleDateString()}
                </span>

                <span>{a.course}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge>{a.status}</Badge>

              {a.status === "Not Started" && (
                <Button onClick={() => handleStatus(a._id, "In Progress")}>
                  Start
                </Button>
              )}

              {a.status === "In Progress" && (
                <Button onClick={() => handleStatus(a._id, "Submitted")}>
                  Submit
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}