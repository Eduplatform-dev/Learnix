import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

/* ================= TYPES ================= */

export type ContentType = "video" | "pdf" | "image";

export type Content = {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  folder?: string;
  publicId?: string;
  resourceType?: string;
  createdAt?: any;
};

const col = collection(db, "contents");

/* ================= CREATE ================= */

export const createContent = async (data: {
  title: string;
  type: ContentType;
  url: string;
  folder?: string;
  publicId?: string;
  resourceType?: string;
}) => {
  await addDoc(col, {
    title: data.title,
    type: data.type,
    url: data.url,
    folder: data.folder || "general",
    publicId: data.publicId ?? null,
    resourceType: data.resourceType ?? null,
    createdAt: serverTimestamp(),
  });
};

/* ================= GET ================= */

export const getContents = async (): Promise<Content[]> => {
  try {
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Content, "id">),
    }));
  } catch (err) {
    console.error("Failed to load contents:", err);
    return [];
  }
};

/* ================= UPDATE ================= */

export const updateContent = async (
  id: string,
  data: Partial<Content>
) => {
  await updateDoc(doc(db, "contents", id), data);
};

/* ================= SIMPLE DELETE ================= */

export const deleteContent = async (id: string) => {
  await deleteDoc(doc(db, "contents", id));
};

/* ================= PROFESSIONAL DELETE VIA API ================= */

export const deleteContentViaApi = async (contentId: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as
    | string
    | undefined;

  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL not set");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE_URL}/api/content/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contentId }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Delete failed");
  }

  return res.json();
};
