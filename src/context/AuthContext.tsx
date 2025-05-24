import React, { createContext, useContext, useState, useEffect } from "react";
import { AUTH_CONFIG } from "@/config/auth";

type UserRole = "admin" | "user" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>(null);

  // Verificar si ya hay una sesión guardada al cargar la página
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole === "admin" || savedRole === "user") {
      setIsAuthenticated(true);
      setRole(savedRole as UserRole);
    }
  }, []);

  const login = (password: string): boolean => {
    if (AUTH_CONFIG.verifyPassword(password, "admin")) {
      setIsAuthenticated(true);
      setRole("admin");
      localStorage.setItem("userRole", "admin");
      return true;
    } else if (AUTH_CONFIG.verifyPassword(password, "user")) {
      setIsAuthenticated(true);
      setRole("user");
      localStorage.setItem("userRole", "user");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem("userRole");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
