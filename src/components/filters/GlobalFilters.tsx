import React, { useEffect, useState } from 'react';
import { useFilters } from '@/context/FilterContext';
import { Card, CardContent } from '@/components/ui/card';
import { fetchUniqueApartments } from '@/services/airtableService';
import { BasicFilters } from './BasicFilters';
import { AdvancedFilters } from './AdvancedFilters';
import { FilterActions } from './FilterActions';
import { MobileFilters } from './MobileFilters';

export const GlobalFilters: React.FC = () => {
  const { filters, appliedFilters, viewContext, currentApartment } = useFilters();
  const [apartments, setApartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    const loadApartments = async () => {
      setLoading(true);
      try {
        const apartmentList = await fetchUniqueApartments();
        setApartments(apartmentList);
      } catch (error) {
        console.error('Error al cargar apartamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApartments();
  }, []);

  // Verifica si hay filtros seleccionados diferentes de los aplicados
  const hasFilterChanges = (): boolean => {
    // Si estamos en vista de detalle, ignorar el filtro de apartamento para esta comparación
    if (viewContext === 'detail' && currentApartment) {
      const { apartment: filterApartment, ...restFilters } = filters;
      const { apartment: appliedApartment, ...restAppliedFilters } = appliedFilters;
      
      return JSON.stringify(restFilters) !== JSON.stringify(restAppliedFilters);
    }
    
    return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  };

  // Verifica si hay filtros aplicados
  const hasActiveFilters = (): boolean => {
    // En vista de detalle, no consideramos el apartamento como un filtro activo
    if (viewContext === 'detail' && currentApartment) {
      return !!(
        appliedFilters.month || 
        appliedFilters.bookingSource || 
        appliedFilters.paymentStatus !== null || 
        appliedFilters.dateRange.from || 
        appliedFilters.dateRange.to ||
        appliedFilters.compareMode
      );
    }
    
    return !!(
      appliedFilters.month || 
      appliedFilters.apartment || 
      appliedFilters.bookingSource || 
      appliedFilters.paymentStatus !== null || 
      appliedFilters.dateRange.from || 
      appliedFilters.dateRange.to ||
      appliedFilters.compareMode
    );
  };

  return (
    <Card className="mb-4 sm:mb-6 border-border">
      <CardContent className="pt-4 sm:pt-6">
        <MobileFilters 
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          hasActiveFilters={hasActiveFilters()}
        />
        
        <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-start sm:items-end">
            <BasicFilters
              apartments={apartments}
              loading={loading}
              yearOptions={yearOptions}
              isDetailView={viewContext === 'detail'}
              currentApartment={currentApartment}
            />

            <div className="w-full md:w-auto flex flex-wrap gap-2 mt-4 md:mt-0">
              <AdvancedFilters yearOptions={yearOptions} />
              <FilterActions 
                hasFilterChanges={hasFilterChanges()} 
                hasActiveFilters={hasActiveFilters()} 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
