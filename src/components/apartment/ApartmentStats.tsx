
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApartmentSummary } from '@/types';
import { useFilters } from '@/context/FilterContext';

interface ApartmentStatsProps {
  summary: ApartmentSummary;
}

const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

export const ApartmentStats: React.FC<ApartmentStatsProps> = ({ summary }) => {
  const { appliedFilters, viewContext } = useFilters();
  
  // Generar un título que incluya información del período seleccionado
  const getPeriodTitle = () => {
    let periodText = `${appliedFilters.year}`;
    if (appliedFilters.month) {
      periodText = `${appliedFilters.month} ${appliedFilters.year}`;
    }
    return periodText;
  };
  
  const statItems = [
    {
      label: 'Reservas Totales',
      value: summary.bookings
    },
    {
      label: 'Ingresos Totales',
      value: formatter.format(summary.totalRevenue)
    },
    {
      label: 'Tarifa Promedio',
      value: formatter.format(summary.averageNightlyRate)
    },
    {
      label: 'Ocupación',
      value: `${Math.round(summary.occupancyRate)}%`
    },
    {
      label: 'Noches Totales',
      value: summary.totalNights
    },
    {
      label: 'Estancia Promedio',
      value: `${summary.averageStay.toFixed(1)} noches`
    }
  ];

  // Determinar el título basado en el contexto de la vista
  const cardTitle = viewContext === 'detail'
    ? `Estadísticas del Apartamento - ${getPeriodTitle()}`
    : `Resumen del Apartamento - ${summary.name} - ${getPeriodTitle()}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <p className="text-xl font-bold text-rental-dark">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
