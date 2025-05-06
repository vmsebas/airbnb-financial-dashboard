import React from 'react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';

interface DashboardChartsProps {
  monthlyRevenueData: any[];
  occupancyData: any[];
  compareMode?: boolean;
  compareData?: any;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyRevenueData,
  occupancyData,
  compareMode = false,
  compareData = null
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <RevenueChart 
        data={monthlyRevenueData} 
        title="Ingresos Mensuales" 
        compareMode={compareMode}
        compareData={compareData?.monthlyData}
      />
      <OccupancyChart 
        data={occupancyData} 
        title="Tasa de Ocupación" 
        compareMode={compareMode}
        compareData={compareData?.monthlyData}
      />
    </div>
  );
};
