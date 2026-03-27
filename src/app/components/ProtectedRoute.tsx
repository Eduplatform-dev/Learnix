import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type UserRole = "student" | "admin" | "instructor";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {

  const { user, loading } = useAuth();
  const location = useLocation();

  /* WAIT FOR AUTH RESTORE */

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* NOT LOGGED IN */

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  /* ROLE CHECK */

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    const redirectPath =
      user.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;