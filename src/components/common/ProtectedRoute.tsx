import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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

  return <>{children}</>;
};

export default ProtectedRoute;