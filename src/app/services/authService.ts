import { app, db, googleProvider } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";

export type UserRole = "user" | "admin";

export const auth = getAuth(app);

/* ---------------- REGISTER ---------------- */
export const registerUser = async (
  email: string,
  password: string,
  username: string
): Promise<UserCredential> => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // Save user profile safely
  await setDoc(
    doc(db, "users", res.user.uid),
    {
      email,
      username,
      role: "user", // always user
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return res;
};

/* ---------------- LOGIN ---------------- */
export const loginUser = (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/* ---------------- GOOGLE LOGIN ---------------- */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const res = await signInWithPopup(auth, googleProvider);

  await setDoc(
    doc(db, "users", res.user.uid),
    {
      email: res.user.email,
      username: res.user.displayName || "User",
      role: "user",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return res;
};
