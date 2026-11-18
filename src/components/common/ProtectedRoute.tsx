import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const isStudentRole = (role: unknown) =>
  String(role || "").trim().toUpperCase() === "STUDENT";

const ProtectedRoute = ({
  children,
  area,
}: {
  children: React.ReactNode;
  area?: "student" | "staff";
}) => {
  const { user, initialized } = useSelector(
    (state: any) => state.auth
  );
  // Wait until /auth/me has completed
  if (!initialized) {
    return <div>Loading...</div>;
  }

  // User is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (area === "student" && !isStudentRole(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (area === "staff" && isStudentRole(user.role)) {
    return <Navigate to="/student-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
