import React from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, BarChart, CalendarDays, Users } from 'lucide-react';

interface BasicMetricsProps {
  totalRevenue: number;
  totalProfit: number;
  averageNightlyRate: number;
  totalCleaningFees: number;
  formatter: Intl.NumberFormat;
  compareMode?: boolean;
  compareData?: any;
}

export const BasicMetrics: React.FC<BasicMetricsProps> = ({
  totalRevenue,
  totalProfit,
  averageNightlyRate,
  totalCleaningFees,
  formatter,
  compareMode = false,
  compareData = null
}) => {
  // Calcular las tendencias basadas en los datos comparativos si están disponibles
  const calculateTrend = (currentValue: number, previousValue?: number) => {
    if (!compareMode || !previousValue) {
      return { value: 0, isPositive: true };
    }
    
    const diff = currentValue - previousValue;
    const percentChange = previousValue !== 0 ? (diff / previousValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: diff >= 0
    };
  };
  
  // Obtener valores del año anterior si están disponibles
  const prevRevenue = compareData?.revenue || 0;
  const prevProfit = compareData?.profit || 0;
  const prevRate = compareData?.averageNightlyRate || 0;
  const prevCleaningFees = compareData?.cleaningFees || 0;
  
  // Calcular tendencias
  const revenueTrend = calculateTrend(totalRevenue, prevRevenue);
  const profitTrend = calculateTrend(totalProfit, prevProfit);
  const rateTrend = calculateTrend(averageNightlyRate, prevRate);
  const cleaningTrend = calculateTrend(totalCleaningFees, prevCleaningFees);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <StatCard 
        title="Ingresos Totales" 
        value={formatter.format(totalRevenue)}
        icon={<DollarSign className="h-5 w-5" />}
        trend={compareMode ? revenueTrend : undefined}
        tooltip="Total de ingresos generados por alquileres"
      />
      <StatCard 
        title="Beneficio Total" 
        value={formatter.format(totalProfit)}
        icon={<BarChart className="h-5 w-5" />}
        trend={compareMode ? profitTrend : undefined}
        tooltip="Beneficio neto después de gastos"
      />
      <StatCard 
        title="Precio Promedio/Noche" 
        value={formatter.format(averageNightlyRate)}
        icon={<CalendarDays className="h-5 w-5" />}
        trend={compareMode ? rateTrend : undefined}
        tooltip="Precio promedio por noche de alquiler"
      />
      <StatCard 
        title="Total Gastos Limpieza" 
        value={formatter.format(totalCleaningFees)}
        icon={<Users className="h-5 w-5" />}
        trend={compareMode ? cleaningTrend : undefined}
        tooltip="Total de gastos en servicios de limpieza"
      />
    </div>
  );
};
