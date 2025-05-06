import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface YearComparisonFilterProps {
  availableYears: number[];
  selectedYears: number[];
  currentYear: number;
  onChange: (years: number[]) => void;
}

export const YearComparisonFilter: React.FC<YearComparisonFilterProps> = ({
  availableYears,
  selectedYears,
  currentYear,
  onChange
}) => {
  // Filtrar años disponibles (excluyendo el año actual)
  // Asegurar que tengamos años disponibles para comparar
  const filteredYears = availableYears.length > 0 
    ? availableYears.filter(year => year !== currentYear)
    : [currentYear - 1, currentYear - 2, currentYear - 3].filter(year => year > 0);
  
  // Estado para controlar el popover
  const [open, setOpen] = React.useState(false);
  
  // Seleccionar un año
  const handleSelect = (year: number) => {
    if (selectedYears.includes(year)) {
      // Si ya está seleccionado, quítalo
      onChange(selectedYears.filter(y => y !== year));
    } else {
      // Si no está seleccionado, agrégalo
      onChange([...selectedYears, year]);
    }
  };
  
  // Remover un año seleccionado
  const handleRemove = (year: number) => {
    onChange(selectedYears.filter(y => y !== year));
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Comparar con años anteriores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="year-comparison">Seleccionar años para comparar:</Label>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedYears.length > 0
                  ? `${selectedYears.length} año(s) seleccionado(s)`
                  : "Seleccionar años..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar año..." />
                <CommandEmpty>No se encontraron años.</CommandEmpty>
                <CommandGroup>
                  {filteredYears.map((year) => (
                    <CommandItem
                      key={year}
                      value={String(year)}
                      onSelect={() => handleSelect(year)}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedYears.includes(year) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {year}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {selectedYears.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedYears.map(year => (
                <Badge key={year} variant="secondary">
                  {year}
                  <span
                    role="button"
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => handleRemove(year)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Quitar {year}</span>
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
