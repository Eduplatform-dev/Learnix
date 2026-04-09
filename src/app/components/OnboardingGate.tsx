import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider";
import { getAuthHeader } from "../services/authService";
import { StudentOnboarding } from "./onboarding/StudentOnboarding";
import { InstructorOnboarding } from "./onboarding/InstructorOnboarding";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type ProfileStatus = "loading" | "needs_onboarding" | "done";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProfileStatus>("loading");

  useEffect(() => {
    if (!user) { setStatus("done"); return; }
    if (user.role === "admin") { setStatus("done"); return; }
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    try {
      const endpoint =
        user!.role === "student"
          ? "/api/profiles/student/me"
          : "/api/profiles/instructor/me";

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers:     getAuthHeader(),
        credentials: "include",
      });

      if (!res.ok) { setStatus("needs_onboarding"); return; }

      const data = await res.json();
      setStatus(!data || !data.isSubmitted ? "needs_onboarding" : "done");
    } catch {
      setStatus("done");
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Checking your profile...</p>
        </div>
      </div>
    );
  }

  if (status === "needs_onboarding") {
    if (user?.role === "student")    return <StudentOnboarding    onComplete={() => setStatus("done")} />;
    if (user?.role === "instructor") return <InstructorOnboarding onComplete={() => setStatus("done")} />;
  }

  return <>{children}</>;
}