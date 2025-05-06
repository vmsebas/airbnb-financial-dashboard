import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, UserCircle, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

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
  
  // Función para cambiar entre modo claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Funciones para acceso rápido durante desarrollo
  const quickAccessAdmin = () => {
    setSelectedRole("admin");
    login("admin");
    navigate("/");
  };
  
  const quickAccessUser = () => {
    setSelectedRole("user");
    login("user");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="space-y-1 relative">
          {/* Botón para cambiar tema */}
          <div className="absolute right-2 top-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          
          <CardTitle className="text-2xl font-bold text-center dark:text-white">
            Airbnb Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botones de acceso rápido para desarrollo */}
          <div className="mb-6 space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Acceso rápido para desarrollo</div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1 flex items-center justify-center gap-2 dark:border-gray-600 dark:text-gray-300"
                onClick={quickAccessAdmin}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 flex items-center justify-center gap-2 dark:border-gray-600 dark:text-gray-300"
                onClick={quickAccessUser}
              >
                <UserCircle className="h-4 w-4" />
                <span>Usuario</span>
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Selector de rol */}
              <div className="space-y-2">
                <Label htmlFor="role-selection" className="dark:text-gray-300">Selecciona tu rol</Label>
                <RadioGroup 
                  defaultValue="user" 
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as "admin" | "user")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="dark:text-gray-300">Administrador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="dark:text-gray-300">Usuario</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Campo de contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">Contraseña</Label>
                <Input
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-rental-primary hover:bg-rental-primary/90 dark:bg-rental-primary dark:hover:bg-rental-primary/90">
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            <p>Para acceder, contacta al administrador del sistema</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
