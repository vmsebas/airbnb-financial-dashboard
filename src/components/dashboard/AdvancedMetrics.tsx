import React from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingUp, Home, CalendarDays, BarChart } from 'lucide-react';

interface AdvancedMetricsProps {
  revPAR: number;
  adr: number;
  occupancyRate: number;
  profitability: number;
  formatter: Intl.NumberFormat;
  compareMode?: boolean;
  compareData?: any;
}

export const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({
  revPAR,
  adr,
  occupancyRate,
  profitability,
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
  const prevRevPAR = compareData?.revPAR || 0;
  const prevADR = compareData?.adr || 0;
  const prevOccupancy = compareData?.occupancyRate || 0;
  const prevProfitability = compareData?.profitability || 0;
  
  // Calcular tendencias
  const revPARTrend = calculateTrend(revPAR, prevRevPAR);
  const adrTrend = calculateTrend(adr, prevADR);
  const occupancyTrend = calculateTrend(occupancyRate, prevOccupancy);
  const profitabilityTrend = calculateTrend(profitability, prevProfitability);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <StatCard 
        title="RevPAR" 
        value={formatter.format(revPAR)}
        icon={<TrendingUp className="h-5 w-5" />}
        trend={compareMode ? revPARTrend : undefined}
        tooltip="Revenue Per Available Room - Ingresos por habitación disponible"
      />
      <StatCard 
        title="ADR" 
        value={formatter.format(adr)}
        icon={<Home className="h-5 w-5" />}
        trend={compareMode ? adrTrend : undefined}
        tooltip="Average Daily Rate - Tarifa media diaria"
      />
      <StatCard 
        title="Tasa de Ocupación" 
        value={`${occupancyRate.toFixed(1)}%`}
        icon={<CalendarDays className="h-5 w-5" />}
        trend={compareMode ? occupancyTrend : undefined}
        tooltip="Porcentaje de días ocupados sobre el total disponible"
      />
      <StatCard 
        title="Rentabilidad" 
        value={`${profitability.toFixed(1)}%`}
        icon={<BarChart className="h-5 w-5" />}
        trend={compareMode ? profitabilityTrend : undefined}
        tooltip="Porcentaje de beneficio sobre los ingresos totales"
      />
    </div>
  );
};
