import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Only allow users who are NOT logged in.
 */
export function RequireGuest({ children }) {
  const user = useSelector((state) => state.auth.user);
  return !user ? children : <Navigate to="/jobs" replace />;
}

/**
 * Only allow admin or super-admin.
 */
export function RequireAdminOrSuper({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
    return <Navigate to="/jobs" replace />;
  }
  return children;
}

/**
 * Only allow super-admin.
 */
export function RequireSuperAdmin({ children }) {
  const user = useSelector((state) => state.auth.user);
  return user?.role === "super-admin" ? children : <Navigate to="/jobs" replace />;
}
