import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    
    if (success) {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Redireccionando al dashboard",
        duration: 3000,
      });
      navigate("/");
    } else {
      toast({
        title: "Error de autenticación",
        description: "La contraseña es incorrecta",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Airbnb Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Selector de rol */}
              <div className="space-y-2">
                <Label htmlFor="role-selection">Selecciona tu rol</Label>
                <RadioGroup 
                  defaultValue="user" 
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as "admin" | "user")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Administrador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user">Usuario</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Campo de contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <div>
            <p>Para acceder, contacta al administrador del sistema</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
