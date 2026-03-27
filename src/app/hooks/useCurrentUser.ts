// src/app/hooks/useCurrentUser.ts

import { useAuth } from "../providers/AuthProvider";

export const useCurrentUser = () => {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};