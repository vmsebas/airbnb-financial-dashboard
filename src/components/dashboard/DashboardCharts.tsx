import React from 'react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';

interface DashboardChartsProps {
  monthlyRevenueData: any[]; // Data pre-formateada para comparación multi-anual
  occupancyData: any[];
  yearKeys: string[]; // Para RevenueChart
  yearLabels: Record<string, string>; // Para RevenueChart
  // Props para la comparación en OccupancyChart (si la tiene)
  compareMode?: boolean;
  compareData?: any; // Podría ser un objeto como { monthlyData: ... }
  bookingChannelsData?: any[]; // Nueva prop
  advancedAnalysisData?: any; // Nueva prop
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyRevenueData,
  occupancyData,
  yearKeys,
  yearLabels,
  compareMode = false, // Para OccupancyChart
  compareData = null,   // Para OccupancyChart
  bookingChannelsData, // Desestructurar nueva prop
  advancedAnalysisData, // Desestructurar nueva prop
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <RevenueChart 
        data={monthlyRevenueData} 
        title="Ingresos Mensuales" 
        yearKeys={yearKeys}
        yearLabels={yearLabels}
      />
      <OccupancyChart 
        data={occupancyData} 
        title="Tasa de Ocupación" 
        compareMode={compareMode}
        compareData={compareData?.monthlyData}
      />
      {/* Aquí se podrían añadir los nuevos gráficos más adelante */}
      {/* {bookingChannelsData && <BookingSourcesChart data={bookingChannelsData} />} */}
      {/* {advancedAnalysisData && <AdvancedAnalysisChart data={advancedAnalysisData} />} */}
    </div>
  );
};
