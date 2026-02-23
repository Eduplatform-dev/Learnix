import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

/* ================= TYPES ================= */
export type CourseStatus = "In Progress" | "Completed" | "Not Started";

export type Course = {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  status: CourseStatus;
  image: string;
  createdAt?: unknown;
};

/* ================= HELPERS ================= */
function normalizeStatus(value: any): CourseStatus {
  if (
    value === "In Progress" ||
    value === "Completed" ||
    value === "Not Started"
  ) {
    return value;
  }
  return "Not Started";
}

/* ================= GET ================= */
export const getCourses = async (): Promise<Course[]> => {
  try {
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        title: String(data.title ?? ""),
        instructor: String(data.instructor ?? ""),
        duration: String(data.duration ?? ""),
        students: Number(data.students ?? 0),
        rating: Number(data.rating ?? 0),
        progress: Number(data.progress ?? 0),
        status: normalizeStatus(data.status),
        image: String(data.image ?? ""),
        createdAt: data.createdAt,
      };
    });
  } catch (err) {
    console.error("Failed to load courses:", err);
    return [];
  }
};

/* ================= CREATE ================= */
export const createCourse = async (data: {
  title: string;
  instructor: string;
  duration: string;
}) => {
  await addDoc(collection(db, "courses"), {
    title: data.title,
    instructor: data.instructor,
    duration: data.duration,
    students: 0,
    rating: 0,
    progress: 0,
    status: "Not Started",
    image: "",
    createdAt: serverTimestamp(),
  });
};

/* ================= UPDATE ================= */
export const updateCourse = async (
  id: string,
  data: {
    title: string;
    instructor: string;
    duration: string;
  }
) => {
  const ref = doc(db, "courses", id);

  await updateDoc(ref, {
    title: data.title,
    instructor: data.instructor,
    duration: data.duration,
  });
};

/* ================= DELETE ================= */
export const deleteCourse = async (id: string) => {
  await deleteDoc(doc(db, "courses", id));
};
