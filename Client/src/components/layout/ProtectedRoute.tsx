import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  // Set to true for the change-password page itself so it isn't redirect-looped
  skipPasswordCheck?: boolean;
}

// Guards a route: redirects to /login if not authenticated, /change-password if flag is set
const ProtectedRoute = ({
  children,
  allowedRoles,
  skipPasswordCheck = false,
}: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.must_change_password && !skipPasswordCheck) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = user.role === "lineworker" ? "/lineworker" : "/";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
