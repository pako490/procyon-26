
import { Navigate, Outlet } from "react-router-dom";
import {
  useCurrentUser,
  type UserRole,
} from "../hooks/useCurrentUser";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const {
    role,
    isAuthenticated,
    isLoading,
    error,
  } = useCurrentUser();

  // Wait for Auth0 authentication and database synchronization
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect unauthenticated users to the homepage
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Handle errors retrieving user information
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Ensure the authenticated user has an associated database role
  if (!role) {
    return <div>User role not found.</div>;
  }

  // Check if the user's role is allowed to access these routes
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/auth-redirect" replace />;
  }

  // Render the matching nested route after authorization
  //
  // Outlet allows multiple routes to share the same ProtectedRoute.
  // This avoids individually wrapping each page and centralizes
  // authentication for groups of routes.
  //
  // For RASER, Designer and Editor routes can each share
  // a single ProtectedRoute with their respective role requirements.

  return <Outlet />;
}

export default ProtectedRoute;
