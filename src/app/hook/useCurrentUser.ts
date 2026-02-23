import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import type { UserRole } from "../services/authService";

type CurrentUser = {
  uid: string;
  email: string | null;
  role: UserRole;
  username?: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        let role: UserRole = "user";
        let username = "User";

        if (snap.exists()) {
          role = snap.data()?.role === "admin" ? "admin" : "user";
          username = snap.data()?.username || "User";
        } else {
          await setDoc(
            userRef,
            {
              email: firebaseUser.email,
              username: "User",
              role: "user",
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role,
          username,
        });
      } catch (err) {
        console.error("User load failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { user, loading };
}
