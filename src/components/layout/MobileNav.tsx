import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, BarChart, FileText, Users, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchUniqueApartments } from '@/services/airtableService';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apartments, setApartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  
  const isAdmin = role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/user';
  
  useEffect(() => {
    const loadApartments = async () => {
      try {
        const fetchedApartments = await fetchUniqueApartments(role);
        setApartments(fetchedApartments);
        console.log(`MobileNav - Rol: ${role}, Apartamentos cargados:`, fetchedApartments);
      } catch (error) {
        console.error('Error al cargar los apartamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadApartments();
  }, [role]);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleMenu} 
        className="flex items-center justify-center p-2"
      >
        <Menu size={24} />
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={toggleMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-64 bg-card border-l border-border shadow-lg z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b border-border">
              <h2 className="font-semibold text-foreground">Menu</h2>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={toggleMenu}>
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <nav className="space-y-1">
                <Link 
                  to={dashboardPath} 
                  className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground w-full"
                  onClick={toggleMenu}
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
                        className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground w-full mt-1"
                        onClick={toggleMenu}
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
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground w-full mt-1"
                      onClick={toggleMenu}
                    >
                      <FileText size={20} />
                      <span>Reservas</span>
                    </Link>
                    
                    <Link 
                      to="/guests" 
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground w-full mt-1"
                      onClick={toggleMenu}
                    >
                      <Users size={20} />
                      <span>Huéspedes</span>
                    </Link>
                    
                    <Link 
                      to="/financial" 
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground w-full mt-1"
                      onClick={toggleMenu}
                    >
                      <BarChart size={20} />
                      <span>Financiero</span>
                    </Link>
                    
                    <Link 
                      to="/analyze" 
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground w-full mt-1"
                      onClick={toggleMenu}
                    >
                      <Search size={20} />
                      <span>Analizador</span>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
