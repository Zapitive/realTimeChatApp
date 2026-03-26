import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ProtectedRoute ({ children }) {
  const { accessToken, isAuthLoading } = useAuth();

  if (isAuthLoading){
    return <div>Loading</div>
  }

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};