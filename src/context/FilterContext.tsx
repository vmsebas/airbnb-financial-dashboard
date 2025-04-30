import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAvailableYears } from '@/utils/filterUtils';

export interface FilterState {
  year: number;
  month: string | null; // null o 'all' significa "todos los meses"
  apartment: string[] | null; // Cambiamos a array para permitir selección múltiple
  bookingSource: string | null;
  paymentStatus: boolean | string | null; // true = pagado, false = no pagado, 'all' o null = todos
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  compareMode: boolean;
  compareYear: number | null;
}

interface FilterContextType {
  filters: FilterState;
  appliedFilters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilters: () => void;
  resetFilters: () => void;
  toggleCompareMode: () => void;
  isDetailView: boolean;
  viewContext: 'dashboard' | 'detail';
  currentApartment: string | null;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const getCurrentYear = () => new Date().getFullYear();

const defaultFilters: FilterState = {
  year: getCurrentYear(),
  month: null,
  apartment: null, // null significa "todos los apartamentos"
  bookingSource: null,
  paymentStatus: null,
  dateRange: {
    from: null,
    to: null
  },
  compareMode: false,
  compareYear: null
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentApartment, setCurrentApartment] = useState<string | null>(null);
  const [viewContext, setViewContext] = useState<'dashboard' | 'detail'>('dashboard');
  
  // Intentar cargar filtros guardados del localStorage
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem('rentalFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        console.log('Filtros recuperados de localStorage:', parsedFilters);
        
        // Convertir las fechas de string a Date si existen
        if (parsedFilters.dateRange) {
          if (parsedFilters.dateRange.from) {
            parsedFilters.dateRange.from = new Date(parsedFilters.dateRange.from);
          }
          if (parsedFilters.dateRange.to) {
            parsedFilters.dateRange.to = new Date(parsedFilters.dateRange.to);
          }
        }
        
        return parsedFilters;
      } catch (e) {
        console.error('Error al parsear los filtros guardados:', e);
        return defaultFilters;
      }
    }
    return defaultFilters;
  });
  
  // Mantener un estado separado para los filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);

  // Detectar cambios en la ruta para determinar el contexto
  useEffect(() => {
    // Esta función se ejecuta cuando el componente se monta y cuando cambia la ubicación
    const checkForDetailView = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      
      const isInDetailView = path.includes('/apartment/');
      setIsDetailView(isInDetailView);
      setViewContext(isInDetailView ? 'detail' : 'dashboard');
      
      // Si estamos en una página de detalle, extraer el nombre del apartamento de la URL
      if (isInDetailView) {
        const apartmentName = decodeURIComponent(path.split('/apartment/')[1]);
        if (apartmentName) {
          setCurrentApartment(apartmentName);
          
          // En vista de detalle, forzamos el filtro de apartamento pero mantenemos otros filtros
          setAppliedFilters(prev => ({
            ...prev,
            apartment: [apartmentName] // Cambiamos a array para permitir selección múltiple
          }));
        }
      } else {
        setCurrentApartment(null);
      }
    };

    // Verificar la ruta inicialmente
    checkForDetailView();

    // Añadir un event listener para cambios de ruta
    const handleLocationChange = () => {
      checkForDetailView();
    };

    window.addEventListener('popstate', handleLocationChange);

    // Observar cambios en la navegación mediante el historial
    const originalPushState = history.pushState;
    history.pushState = function() {
      // @ts-ignore: TypeScript no reconoce correctamente el tipo de argumentos
      const result = originalPushState.apply(this, arguments);
      checkForDetailView();
      return result;
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
    };
  }, []);

  // Guardar filtros en localStorage cuando cambien los aplicados
  useEffect(() => {
    try {
      // Determinamos qué filtros guardar basados en el contexto actual
      const filtersToSave = viewContext === 'detail' 
        ? { ...appliedFilters, apartment: null } // No guardar el apartamento específico para vistas de detalle
        : appliedFilters;
        
      // Sólo guardamos si no es una vista de detalle o si ha cambiado algo más que el apartamento
      if (viewContext === 'dashboard' || JSON.stringify(filtersToSave) !== JSON.stringify(appliedFilters)) {
        localStorage.setItem('rentalFilters', JSON.stringify(filtersToSave));
        console.log('Filtros guardados en localStorage:', filtersToSave);
      }
    } catch (e) {
      console.error('Error al guardar filtros en localStorage:', e);
    }
  }, [appliedFilters, viewContext]);

  const applyFilters = () => {
    console.log('Aplicando filtros:', filters);
    setAppliedFilters(prev => {
      // En vista de detalle, siempre mantenemos el apartamento actual
      if (viewContext === 'detail' && currentApartment) {
        return { ...filters, apartment: [currentApartment] }; // Cambiamos a array para permitir selección múltiple
      }
      return { ...filters };
    });
  };

  const resetFilters = () => {
    console.log('Restableciendo filtros a valores predeterminados');
    // En vista de detalle, preservar el apartamento actual
    if (viewContext === 'detail' && currentApartment) {
      const resetFilters = { ...defaultFilters, apartment: [currentApartment] }; // Cambiamos a array para permitir selección múltiple
      setFilters(resetFilters);
      setAppliedFilters(resetFilters);
    } else {
      setFilters(defaultFilters);
      setAppliedFilters(defaultFilters);
    }
  };

  const toggleCompareMode = () => {
    setFilters(prev => {
      const newCompareMode = !prev.compareMode;
      return {
        ...prev,
        compareMode: newCompareMode,
        compareYear: newCompareMode && !prev.compareYear ? prev.year - 1 : prev.compareYear
      };
    });
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      appliedFilters, 
      setFilters, 
      applyFilters, 
      resetFilters, 
      toggleCompareMode,
      isDetailView,
      viewContext,
      currentApartment
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
