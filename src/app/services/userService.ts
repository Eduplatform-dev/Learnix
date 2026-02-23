import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export type UserStatus = "active" | "inactive" | "pending";
export type UserRole = "user" | "admin";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: unknown;
};

/* =========================
   GET ALL USERS (SAFE)
   ========================= */
export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    const snap = await getDocs(collection(db, "users"));

    return snap.docs.map((d) => {
      const data = d.data();

      const email = String(data.email ?? "");
      const username =
        data.username ??
        (email ? email.split("@")[0] : "User");

      return {
        id: d.id,
        username,
        email,
        role: data.role === "admin" ? "admin" : "user",
        status:
          data.status === "inactive"
            ? "inactive"
            : data.status === "pending"
            ? "pending"
            : "active",
        createdAt: data.createdAt,
      };
    });
  } catch (err) {
    console.error("Failed to load users:", err);
    return [];
  }
};

/* =========================
   CREATE USER DOC (BOOTSTRAP SAFE)
   ========================= */
export const createUserDoc = async (
  id: string,
  email: string,
  role: UserRole = "user",
  usernameOverride?: string
) => {
  const username =
    (usernameOverride && usernameOverride.trim()) ||
    (email ? email.split("@")[0] : "User");

  await setDoc(
    doc(db, "users", id),
    {
      username,
      email,
      role,
      status: "active",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/* =========================
   UPDATE USER STATUS
   ========================= */
export const updateUserStatus = async (
  id: string,
  status: UserStatus
) => {
  await updateDoc(doc(db, "users", id), { status });
};

/* =========================
   DELETE USER
   ========================= */
export const deleteUser = async (id: string) => {
  await deleteDoc(doc(db, "users", id));
};
