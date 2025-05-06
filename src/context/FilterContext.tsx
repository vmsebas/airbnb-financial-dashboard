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
  compareYears: number[];
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
  compareYear: null,
  compareYears: []
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentApartment, setCurrentApartment] = useState<string | null>(null);
  const [viewContext, setViewContext] = useState<'dashboard' | 'detail'>('dashboard');
  
  // Estado de los filtros, inicializado directamente con valores predeterminados
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Mantener un estado separado para los filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

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
      
      // Si estamos activando el modo comparación y no hay años seleccionados,
      // añadimos automáticamente el año anterior al actual
      if (newCompareMode && (!prev.compareYears || prev.compareYears.length === 0)) {
        return {
          ...prev,
          compareMode: newCompareMode,
          compareYear: prev.year - 1, // Para compatibilidad con código antiguo
          compareYears: [prev.year - 1] // Añadir el año anterior al array
        };
      }
      
      return {
        ...prev,
        compareMode: newCompareMode,
        // Mantenemos los años de comparación si ya existen
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
