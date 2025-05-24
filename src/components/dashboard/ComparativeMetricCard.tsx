import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { percentFormatter } from '@/utils/formatters';

interface YearData {
  year: number;
  value: number;
  formattedValue: string;
}

interface ComparativeMetricCardProps {
  title: string;
  description?: string;
  currentYearValue: number;
  comparisonData: Array<YearData>;
  formatValue: (value: number) => string;
}

export const ComparativeMetricCard: React.FC<ComparativeMetricCardProps> = ({
  title,
  description,
  currentYearValue,
  comparisonData,
  formatValue
}) => {
  // Ordenar datos de comparación por año descendente
  const sortedComparisonData = [...comparisonData].sort((a, b) => b.year - a.year);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(currentYearValue)}</div>
      </CardContent>
      {sortedComparisonData.length > 0 && (
        <CardFooter className="pt-0 px-6 pb-4">
          <div className="w-full space-y-2">
            {sortedComparisonData.map((yearData) => {
              const percentChange = yearData.value > 0 
                ? ((currentYearValue - yearData.value) / yearData.value) * 100 
                : 0;
              
              const isPositive = percentChange >= 0;
              
              return (
                <div key={yearData.year} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{yearData.year}: {yearData.formattedValue}</span>
                  <div 
                    className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{percentFormatter(Math.abs(percentChange))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
