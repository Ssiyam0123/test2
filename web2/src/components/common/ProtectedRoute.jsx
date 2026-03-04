import { Navigate } from "react-router-dom";
import useAuth from "../../store/useAuth";

export default function ProtectedRoute({ permission, children }) {
  const hasPermission = useAuth((state) => state.hasPermission);

  if (!hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}