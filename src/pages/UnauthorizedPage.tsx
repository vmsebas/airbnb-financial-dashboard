
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso no autorizado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta sección.
        </p>
        <div className="space-y-3">
          <Link to="/">
            <Button className="w-full" variant="default">
              Volver al inicio
            </Button>
          </Link>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => logout()}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
