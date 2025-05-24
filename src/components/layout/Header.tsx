import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, BarChart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/context/FilterContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const Header: React.FC = () => {
  const { logout, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { viewContext, currentApartment } = useFilters();
  
  const isAdmin = role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/user';

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
      duration: 3000,
    });
    navigate('/login');
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to={dashboardPath} className="text-2xl font-bold text-foreground flex items-center">
            <span className="text-rental-primary">Airbnb</span>
            <span className="ml-2">Financial Insights</span>
          </Link>
          {role && (
            <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
              {role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          )}
          {viewContext === 'detail' && currentApartment && (
            <span className="ml-2 bg-rental-primary/10 text-rental-primary px-2 py-0.5 rounded-full text-xs font-medium">
              {currentApartment}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
            <CalendarDays size={18} />
            <span>Calendario</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
            <BarChart size={18} />
            <span>Reportes</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <Settings size={18} />
            <span className="hidden md:inline">Ajustes</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
