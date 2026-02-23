import { createContext, useContext } from "react";
import { useCurrentUser } from "../hook/useCurrentUser";

type AuthContextType = ReturnType<typeof useCurrentUser>;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useCurrentUser();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
