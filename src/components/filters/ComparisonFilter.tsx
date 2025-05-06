import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface ComparisonFilterProps {
  yearOptions: number[];
  onChange: (compareMode: boolean, compareYear: number | null) => void;
}

export const ComparisonFilter: React.FC<ComparisonFilterProps> = ({ yearOptions, onChange }) => {
  const { filters, setFilters } = useFilters();
  
  // Cambiar entre modo comparación activado/desactivado
  const handleToggleCompare = (checked: boolean) => {
    const selectedCompareYear = checked && !filters.compareYear ? filters.year - 1 : filters.compareYear;
    
    // Actualizar el contexto global de filtros
    setFilters(prev => ({
      ...prev,
      compareMode: checked,
      compareYear: selectedCompareYear
    }));
    
    // Notificar al componente padre del cambio
    onChange(checked, selectedCompareYear);
  };
  
  // Cambiar el año con el que comparar
  const handleCompareYearChange = (value: string) => {
    const yearValue = parseInt(value);
    
    // Actualizar el contexto global de filtros
    setFilters(prev => ({
      ...prev,
      compareYear: yearValue
    }));
    
    // Notificar al componente padre del cambio
    onChange(filters.compareMode, yearValue);
  };
  
  // Filtrar opciones de año para no incluir el año actual seleccionado
  // Si no hay opciones disponibles, crear opciones predeterminadas
  const filteredYearOptions = yearOptions.length > 0 
    ? yearOptions.filter(y => y !== filters.year)
    : [filters.year - 1, filters.year - 2, filters.year - 3].filter(y => y > 0);
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="compare-mode"
              checked={filters.compareMode}
              onCheckedChange={handleToggleCompare}
            />
            <Label htmlFor="compare-mode">Comparar con otro año</Label>
          </div>
          
          {filters.compareMode && (
            <div className="w-full md:w-auto">
              <Select
                value={filters.compareYear ? String(filters.compareYear) : ''}
                onValueChange={handleCompareYearChange}
                disabled={!filters.compareMode}
              >
                <SelectTrigger className="w-full md:w-[100px]">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {filteredYearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
