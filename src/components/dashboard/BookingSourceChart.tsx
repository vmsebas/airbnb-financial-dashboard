import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { integerFormatter, percentFormatter, percentIntFormatter } from '@/utils/formatters';

interface BookingSource {
  name: string;
  value: number;
}

interface BookingSourceChartProps {
  sources: BookingSource[];
}

const COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#FFB400', '#007A87'];

// Eliminamos el formateador local ya que ahora usamos los formateadores centralizados

export const BookingSourceChart: React.FC<BookingSourceChartProps> = ({ sources }) => {
  const totalBookings = sources.reduce((sum, source) => sum + source.value, 0);
  
  const data = sources.map((source) => ({
    name: source.name,
    value: source.value,
    percentage: totalBookings > 0 ? (source.value / totalBookings) * 100 : 0
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fuentes de Reservas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-80 w-full p-4">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${percentIntFormatter(percent * 100)}`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'value') return `${integerFormatter.format(value)} reservas`;
                    if (name === 'percentage') return percentFormatter(Number(value));
                    return value;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
