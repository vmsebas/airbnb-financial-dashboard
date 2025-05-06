import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Search, Lock } from "lucide-react";
import { useFilters } from '@/context/FilterContext';
import { currencyFormatter, integerFormatter, percentFormatter, percentIntFormatter } from '@/utils/formatters';
import { calculateBlockedNights } from '@/utils/metrics/financialMetrics';

// Definición actualizada para adaptarse a los datos que recibimos
interface ApartmentSummary {
  apartment: string;
  bookings: number;
  revenue: number;
  profit: number;
  nights: number;
  blockedNights?: number;
  profitability: number;
  revenuePerNight: number;
  profitPerNight: number;
}

interface ApartmentListProps {
  apartments: ApartmentSummary[];
}

// Eliminamos el formateador local ya que ahora usamos los formateadores centralizados

export const ApartmentList: React.FC<ApartmentListProps> = ({ apartments }) => {
  const [sortField, setSortField] = useState<keyof ApartmentSummary>('apartment');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  
  // Obtener los filtros actuales
  const { appliedFilters } = useFilters();
  
  // Sort apartments based on current sort field and direction
  const sortedApartments = [...apartments].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Filter apartments based on filter text
  const filteredApartments = sortedApartments.filter(apartment => 
    apartment.apartment.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Handle sort click
  const handleSort = (field: keyof ApartmentSummary) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: keyof ApartmentSummary) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc'
      ? <ArrowUp className="inline ml-1 h-4 w-4" />
      : <ArrowDown className="inline ml-1 h-4 w-4" />;
  };
  
  // Calcular la tasa de ocupación teniendo en cuenta el mes y año seleccionados
  const calculateOccupancyRate = (nights: number) => {
    // Obtener el año seleccionado
    const year = appliedFilters.year;
    
    // Obtener el mes seleccionado (si hay uno)
    const month = appliedFilters.month;
    
    // Calcular días en el período según el mes y año
    let daysInPeriod: number;
    
    if (month && month !== 'all') {
      // Obtener el índice del mes (0-11)
      const monthIndex = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ].indexOf(month);
      
      if (monthIndex === -1) {
        return 0; // Mes no válido
      }
      
      // Calcular días en el mes seleccionado
      daysInPeriod = new Date(year, monthIndex + 1, 0).getDate();
    } else {
      // Si no hay mes seleccionado, usar el año completo
      // Verificar si es año bisiesto
      daysInPeriod = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
    }
    
    // Calcular tasa de ocupación (noches reservadas / días disponibles)
    return Math.min((nights / daysInPeriod) * 100, 100);
  };
  
  // Calcular los días vacíos (días no ocupados) en el período seleccionado
  const calculateEmptyDays = (nights: number) => {
    // Obtener el año seleccionado
    const year = appliedFilters.year;
    
    // Obtener el mes seleccionado (si hay uno)
    const month = appliedFilters.month;
    
    // Calcular días en el período según el mes y año
    let daysInPeriod: number;
    
    if (month && month !== 'all') {
      // Obtener el índice del mes (0-11)
      const monthIndex = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ].indexOf(month);
      
      if (monthIndex === -1) {
        return 0; // Mes no válido
      }
      
      // Calcular días en el mes seleccionado
      daysInPeriod = new Date(year, monthIndex + 1, 0).getDate();
    } else {
      // Si no hay mes seleccionado, usar el año completo
      // Verificar si es año bisiesto
      daysInPeriod = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
    }
    
    // Calcular días vacíos (días totales - noches ocupadas)
    return Math.max(daysInPeriod - nights, 0);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rendimiento de Apartamentos</CardTitle>
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar apartamento..."
            className="pl-8"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                    onClick={() => handleSort('apartment')}
                  >
                    Apartamento {renderSortIndicator('apartment')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                    onClick={() => handleSort('bookings')}
                  >
                    Reservas {renderSortIndicator('bookings')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                    onClick={() => handleSort('revenue')}
                  >
                    Ingresos {renderSortIndicator('revenue')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                    onClick={() => handleSort('revenuePerNight')}
                  >
                    Precio/Noche {renderSortIndicator('revenuePerNight')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                    onClick={() => handleSort('nights')}
                  >
                    Ocupación {renderSortIndicator('nights')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                  >
                    Noches Vacías
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                  >
                    Noches Bloqueadas
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium text-left p-0 hover:bg-transparent"
                    onClick={() => handleSort('profitability')}
                  >
                    Rentabilidad {renderSortIndicator('profitability')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApartments.length > 0 ? (
                filteredApartments.map((apartment, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <Link 
                        to={`/apartment/${encodeURIComponent(apartment.apartment)}`} 
                        className="text-rental-primary hover:underline font-medium"
                      >
                        {apartment.apartment}
                      </Link>
                    </TableCell>
                    <TableCell>{integerFormatter.format(apartment.bookings)}</TableCell>
                    <TableCell>{currencyFormatter.format(apartment.revenue)}</TableCell>
                    <TableCell>{currencyFormatter.format(apartment.revenuePerNight)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-rental-primary h-2.5 rounded-full" 
                            style={{ width: `${calculateOccupancyRate(apartment.nights)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {percentIntFormatter(calculateOccupancyRate(apartment.nights))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {integerFormatter.format(calculateEmptyDays(apartment.nights))} noches
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-sm">
                          {integerFormatter.format(apartment.blockedNights || 0)} noches
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{percentFormatter(apartment.profitability)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No se encontraron apartamentos con estos criterios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};