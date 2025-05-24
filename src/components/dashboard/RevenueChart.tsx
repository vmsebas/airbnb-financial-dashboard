import React, { useContext } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { currencyFormatter } from '@/utils/formatters';

interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
    bookings?: number;
  }[];
  title: string;
  compareMode?: boolean;
  compareData?: any[];
}

// Eliminamos el formateador local ya que ahora usamos los formateadores centralizados

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title, compareMode = false, compareData = [] }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Colores mejorados para mejor contraste en modo oscuro
  const colors = {
    revenue: isDarkMode ? '#FF7B82' : '#FF5A5F',
    bookings: isDarkMode ? '#4ECDC4' : '#00A699',
    revenueActual: isDarkMode ? '#FF7B82' : '#FF5A5F',
    revenueAnterior: isDarkMode ? '#4ECDC4' : '#00A699',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    text: isDarkMode ? '#ffffff' : '#333333',
    background: isDarkMode ? '#2d3748' : '#ffffff',
    border: isDarkMode ? '#4a5568' : '#e5e7eb',
  };

  // Preparar datos para la comparación si está activada
  const chartData = compareMode && compareData && compareData.length > 0
    ? data.map(item => {
        // Buscar el dato correspondiente en compareData
        const compareItem = compareData.find(c => c.name === item.name);
        
        return {
          ...item,
          revenueActual: item.revenue, // Renombrar para claridad
          revenueAnterior: compareItem ? compareItem.revenue : 0
        };
      })
    : data;
    
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-72 sm:h-80 w-full p-2 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: colors.text }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <YAxis 
                tickFormatter={(value) => currencyFormatter.format(value).replace(/[^0-9,.]/g, '')}
                tick={{ fill: colors.text }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip 
                formatter={(value) => currencyFormatter.format(Number(value))}
                contentStyle={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ color: colors.text, paddingTop: '10px' }} 
                iconType="circle"
              />
              {compareMode ? (
                <>
                  <Bar dataKey="revenueActual" name="Año Actual" fill={colors.revenueActual} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenueAnterior" name="Año Anterior" fill={colors.revenueAnterior} radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <>
                  <Bar dataKey="revenue" name="Ingresos" fill={colors.revenue} radius={[4, 4, 0, 0]} />
                  {data[0]?.bookings !== undefined && (
                    <Bar dataKey="bookings" name="Reservas" fill={colors.bookings} radius={[4, 4, 0, 0]} />
                  )}
                </>
              )}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
