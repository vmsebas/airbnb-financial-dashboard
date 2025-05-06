import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart, FileText, Users, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchUniqueApartments } from '@/services/airtableService';
import { useAuth } from '@/context/AuthContext';

export const SideNav: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();
  const [apartments, setApartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/user';
  
  useEffect(() => {
    const loadApartments = async () => {
      try {
        const fetchedApartments = await fetchUniqueApartments(role);
        setApartments(fetchedApartments);
        console.log(`SideNav - Rol: ${role}, Apartamentos cargados:`, fetchedApartments);
      } catch (error) {
        console.error('Error al cargar los apartamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadApartments();
  }, [role]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <aside className="bg-card border-r border-border h-screen sticky top-0 w-64 hidden md:block overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          <Link 
            to={dashboardPath}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full",
              isActive(dashboardPath) 
                ? "bg-rental-primary text-white" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Apartamentos
            </h3>
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Cargando...</div>
            ) : apartments.length > 0 ? (
              apartments.map((apartment, index) => (
                <Link 
                  key={index} 
                  to={`/apartment/${encodeURIComponent(apartment)}`}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full mt-1",
                    isActive(`/apartment/${encodeURIComponent(apartment)}`) 
                      ? "bg-rental-primary text-white" 
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <MapPin size={20} />
                  <span className="truncate">{apartment}</span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No hay apartamentos disponibles</div>
            )}
          </div>
          
          {isAdmin && (
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Análisis
              </h3>
              
              <Link 
                to="/bookings" 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full mt-1",
                  isActive('/bookings') 
                    ? "bg-rental-primary text-white" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <FileText size={20} />
                <span>Reservas</span>
              </Link>
              
              <Link 
                to="/guests" 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full mt-1",
                  isActive('/guests') 
                    ? "bg-rental-primary text-white" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Users size={20} />
                <span>Huéspedes</span>
              </Link>
              
              <Link 
                to="/financial" 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full mt-1",
                  isActive('/financial') 
                    ? "bg-rental-primary text-white" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <BarChart size={20} />
                <span>Financiero</span>
              </Link>
              
              <Link 
                to="/analyze" 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full mt-1",
                  isActive('/analyze') 
                    ? "bg-rental-primary text-white" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Search size={20} />
                <span>Analizador</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};
