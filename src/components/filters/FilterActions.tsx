
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, FilterX } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { useToast } from '@/components/ui/use-toast';

interface FilterActionsProps {
  hasFilterChanges: boolean;
  hasActiveFilters: boolean;
}

export const FilterActions: React.FC<FilterActionsProps> = ({ hasFilterChanges, hasActiveFilters }) => {
  const { applyFilters, resetFilters } = useFilters();
  const { toast } = useToast();

  const handleApplyFilters = () => {
    applyFilters();
    toast({
      title: "Filtros aplicados",
      description: "Los datos han sido filtrados según tus criterios.",
      duration: 3000,
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="default" 
        className="h-10"
        onClick={handleApplyFilters}
        disabled={!hasFilterChanges}
      >
        <Check className="h-4 w-4 mr-2" />
        Aplicar filtros
      </Button>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={resetFilters}
          title="Reiniciar filtros"
          className="h-10 w-10"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
