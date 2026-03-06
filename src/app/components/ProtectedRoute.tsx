import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type UserRole = "student" | "admin" | "instructor";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  /* ✅ Wait until session restore completes */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ✅ Not logged in */
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // remembers previous page
        replace
      />
    );
  }

  /* ✅ Role-based access control */
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;