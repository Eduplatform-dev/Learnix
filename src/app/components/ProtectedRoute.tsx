import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import React from "react";

type UserRole = "student" | "admin" | "instructor";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // wait until auth restored
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // RBAC check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;