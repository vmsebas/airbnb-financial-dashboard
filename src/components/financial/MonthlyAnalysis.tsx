
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ComposedChart,
  BarChart,
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area
} from 'recharts';
import { FilterState } from '@/context/FilterContext';

interface MonthlyAnalysisProps {
  comparativeData: Array<any>;
  monthlyData: Array<any>;
  filters: FilterState;
  formatter: Intl.NumberFormat;
}

export const MonthlyAnalysis: React.FC<MonthlyAnalysisProps> = ({ 
  comparativeData,
  monthlyData,
  filters,
  formatter
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Mensual {filters.year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === "Ocupación" || name === "Rentabilidad") return `${Number(value).toFixed(1)}%`;
                    return formatter.format(Number(value));
                  }}
                  labelFormatter={(label) => monthlyData.find(m => m.name === label)?.fullName || label}
                />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  name="Ingresos" 
                  fill="#FF5A5F" 
                  yAxisId="left" 
                />
                <Bar 
                  dataKey="profit" 
                  name="Beneficio" 
                  fill="#00A699" 
                  yAxisId="left" 
                />
                {filters.compareMode && (
                  <Line
                    type="monotone"
                    dataKey="previousRevenue"
                    name={`Ingresos ${filters.compareYear}`}
                    stroke="#FF5A5F"
                    strokeDasharray="5 5"
                    yAxisId="left"
                    dot={false}
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  name="Ocupación" 
                  stroke="#007A87" 
                  yAxisId="right"
                />
                <Line 
                  type="monotone" 
                  dataKey="profitability" 
                  name="Rentabilidad" 
                  stroke="#FFB400" 
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Reservas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" name="Reservas" fill="#8E8CD8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Indicadores de Ocupación y Rentabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="occupancy" 
                    name="Ocupación" 
                    stroke="#007A87" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profitability" 
                    name="Rentabilidad" 
                    stroke="#FFB400" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
