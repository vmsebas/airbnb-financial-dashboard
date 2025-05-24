import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Calendar, ChevronDown, X, CheckIcon } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

interface AdvancedFiltersProps {
  yearOptions: number[];
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ yearOptions }) => {
  const { filters, setFilters, applyFilters } = useFilters();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range
    }));
  };
  
  // Obtener los años disponibles para comparación (excluyendo el año actual)
  const availableYears = yearOptions.filter(year => year !== filters.year);
  
  // Estado local para almacenar los años de comparación seleccionados
  const comparisonYears = filters.compareYears || [];
  
  // Manejar selección/deselección de años de comparación
  const handleYearToggle = (year: number) => {
    const isSelected = comparisonYears.includes(year);
    let newYears: number[];
    
    if (isSelected) {
      // Si ya está seleccionado, quitarlo
      newYears = comparisonYears.filter(y => y !== year);
    } else {
      // Si no está seleccionado, agregarlo
      newYears = [...comparisonYears, year];
    }
    
    console.log("Años de comparación actualizados:", newYears);
    
    setFilters({
      ...filters,
      compareYears: newYears,
      // Si hay años seleccionados, activar el modo de comparación
      compareMode: newYears.length > 0
    });
  };
  
  // Remover un año específico
  const handleRemoveYear = (year: number) => {
    const newYears = comparisonYears.filter(y => y !== year);
    
    console.log("Año eliminado, años restantes:", newYears);
    
    setFilters({
      ...filters,
      compareYears: newYears,
      // Si no quedan años, desactivar el modo de comparación
      compareMode: newYears.length > 0
    });
  };
  
  // Activar/desactivar modo de comparación
  const toggleCompareMode = (enabled: boolean) => {
    console.log("Modo de comparación cambiado a:", enabled);
    
    if (enabled) {
      // Si se activa y no hay años seleccionados, agregar el año anterior como predeterminado
      const defaultYear = filters.year - 1;
      const newCompareYears = (!filters.compareYears || filters.compareYears.length === 0) 
        ? [defaultYear] 
        : filters.compareYears;
      
      console.log("Agregando año predeterminado:", defaultYear);
      
      setFilters(prev => ({
        ...prev,
        compareMode: true,
        compareYears: newCompareYears
      }));
    } else {
      // Si se desactiva, mantener los años seleccionados pero desactivar el modo
      setFilters(prev => ({
        ...prev,
        compareMode: false
      }));
    }
  };

  // Aplicar los filtros cuando se cierre el popover
  useEffect(() => {
    if (!popoverOpen && (filters.compareMode || (filters.compareYears && filters.compareYears.length > 0))) {
      console.log("Aplicando filtros con modo comparativo:", filters.compareMode, "años:", filters.compareYears);
      applyFilters();
    }
  }, [popoverOpen, filters.compareMode, filters.compareYears, applyFilters]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-10"
          title="Filtros avanzados"
        >
          <Calendar className="h-4 w-4" />
          {filters.compareMode ? 
            `Comparación (${comparisonYears.length} año${comparisonYears.length !== 1 ? 's' : ''})` : 
            'Rango de fechas'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <h3 className="font-medium">Seleccionar fechas</h3>
          
          <DatePickerWithRange 
            dateRange={{
              from: filters.dateRange.from,
              to: filters.dateRange.to
            }}
            onDateRangeChange={handleDateRangeChange}
          />
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="compare-mode">Comparar años</Label>
              <Switch 
                id="compare-mode"
                checked={filters.compareMode}
                onCheckedChange={toggleCompareMode}
              />
            </div>
            
            {filters.compareMode && (
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="compare-years" className="mb-2 block">Seleccionar años para comparar:</Label>
                  
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const year = parseInt(value);
                      if (!isNaN(year)) {
                        handleYearToggle(year);
                      }
                    }}
                  >
                    <SelectTrigger id="compare-years" className="w-full">
                      <SelectValue placeholder={
                        comparisonYears.length > 0
                          ? `${comparisonYears.length} año(s) seleccionado(s)`
                          : "Seleccionar años para comparar"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={String(year)}>
                          <div className="flex items-center">
                            <div className={cn(
                              "mr-2 h-4 w-4 rounded-sm border border-primary flex items-center justify-center",
                              comparisonYears.includes(year) ? "bg-primary text-primary-foreground" : "opacity-50"
                            )}>
                              {comparisonYears.includes(year) && (
                                <CheckIcon className="h-3 w-3" />
                              )}
                            </div>
                            {year}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {comparisonYears.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {comparisonYears.map(year => (
                      <Badge key={year} variant="secondary">
                        {year}
                        <button
                          type="button"
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onClick={() => handleRemoveYear(year)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Quitar {year}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button className="w-full" onClick={() => {
            applyFilters();
            setPopoverOpen(false);
          }}>
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
