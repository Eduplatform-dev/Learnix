import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider";
import { StudentOnboarding } from "./onboarding/StudentOnboarding";
import { InstructorOnboarding } from "./onboarding/InstructorOnboarding";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type ProfileStatus = "loading" | "needs_onboarding" | "done";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProfileStatus>("loading");

  useEffect(() => {
    if (!user) {
      setStatus("done");
      return;
    }
    // Admin never needs onboarding
    if (user.role === "admin") {
      setStatus("done");
      return;
    }
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    try {
      const token    = localStorage.getItem("token");
      const endpoint = user!.role === "student"
        ? "/api/profiles/student/me"
        : "/api/profiles/instructor/me";

      const res  = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // 401 = not logged in, treat as done (AuthProvider handles redirect)
        setStatus("done");
        return;
      }

      const data = await res.json();

      // null response or not yet submitted → show onboarding
      if (!data || !data.isSubmitted) {
        setStatus("needs_onboarding");
      } else {
        setStatus("done");
      }
    } catch {
      // Network error — let them through, don't block forever
      setStatus("done");
    }
  };

  const handleOnboardingComplete = () => {
    setStatus("done");
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (status === "needs_onboarding") {
    if (user?.role === "student") {
      return <StudentOnboarding onComplete={handleOnboardingComplete} />;
    }
    if (user?.role === "instructor") {
      return <InstructorOnboarding onComplete={handleOnboardingComplete} />;
    }
  }

  return <>{children}</>;
}