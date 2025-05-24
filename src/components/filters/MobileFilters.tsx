
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, FilterX } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';

interface MobileFiltersProps {
  showMobileFilters: boolean;
  setShowMobileFilters: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveFilters: boolean;
}

export const MobileFilters: React.FC<MobileFiltersProps> = ({ 
  showMobileFilters, 
  setShowMobileFilters, 
  hasActiveFilters 
}) => {
  const { resetFilters, appliedFilters } = useFilters();
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex md:hidden mb-4 justify-between items-center">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <Filter className="h-4 w-4" />
        Filtros
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full">
            {Object.values(appliedFilters).filter(v => v !== null && v !== false && v !== currentYear).length}
          </span>
        )}
      </Button>
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          title="Reiniciar filtros"
          className="h-9"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
