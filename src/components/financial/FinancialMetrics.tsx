
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterState } from '@/context/FilterContext';

interface FinancialMetricsProps {
  totalRevenue: number;
  totalProfit: number;
  profitability: number;
  occupancyRate: number;
  revenueChange?: number;
  profitChange?: number;
  filters: FilterState;
  formatter: Intl.NumberFormat;
  percentFormatter: Intl.NumberFormat;
}

export const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
  totalRevenue,
  totalProfit,
  profitability,
  occupancyRate,
  revenueChange,
  profitChange,
  filters,
  formatter,
  percentFormatter
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
            {filters.compareMode && revenueChange !== undefined && (
              <div className={`text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs {filters.compareYear}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{formatter.format(totalProfit)}</div>
            {filters.compareMode && profitChange !== undefined && (
              <div className={`text-sm ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}% vs {filters.compareYear}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rentabilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentFormatter.format(profitability/100)}</div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentFormatter.format(occupancyRate/100)}</div>
        </CardContent>
      </Card>
    </div>
  );
};
