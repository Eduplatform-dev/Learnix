import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export type AssignmentStatus = "Not Started" | "In Progress" | "Submitted";
export type AssignmentPriority = "high" | "medium" | "low";
export type AssignmentType = "Project" | "Quiz" | "Lab";

export type Assignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  type: AssignmentType;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  userId: string;
  createdAt?: unknown;
};

export const getAssignments = async (
  userId: string
): Promise<Assignment[]> => {
  try {
    const q = query(
      collection(db, "assignments"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: String(data.title ?? ""),
        course: String(data.course ?? ""),
        dueDate: String(data.dueDate ?? ""),
        type: data.type ?? "Project",
        status: data.status ?? "Not Started",
        priority: data.priority ?? "medium",
        userId: String(data.userId),
        createdAt: data.createdAt,
      };
    });
  } catch (err) {
    console.error("Failed to load assignments:", err);
    return [];
  }
};

export const updateAssignmentStatus = async (
  id: string,
  status: AssignmentStatus
) => {
  await updateDoc(doc(db, "assignments", id), { status });
};
