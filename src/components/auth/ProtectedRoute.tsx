
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user" | null;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = null 
}) => {
  const { isAuthenticated, role } = useAuth();

  console.log(`ProtectedRoute - isAuthenticated: ${isAuthenticated}, userRole: ${role}, requiredRole: ${requiredRole}`);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && role !== requiredRole) {
    console.log(`Acceso denegado: requiere ${requiredRole}, usuario tiene ${role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
