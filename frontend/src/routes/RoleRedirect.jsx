import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRedirect = ({ children }) => {
  const { user } = useAuth();

  if (!user) return children;

  switch (user.role) {
    case "candidate":
      return <Navigate to="/candidate" />;
    case "employer":
      return <Navigate to="/employer/dashboard" />;
    case "admin":
      return <Navigate to="/admin" />;
    default:
      return children;
  }
};

export default RoleRedirect;
