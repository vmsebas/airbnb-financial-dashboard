import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { percentFormatter } from '@/utils/formatters';

interface OccupancyChartProps {
  data: {
    name: string;
    occupancy: number;
  }[];
  title: string;
  compareMode?: boolean;
  compareData?: any[];
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ data, title, compareMode = false, compareData = [] }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Colores mejorados para mejor contraste en modo oscuro
  const colors = {
    occupancy: isDarkMode ? '#FF7B82' : '#FF5A5F',
    occupancyActual: isDarkMode ? '#FF7B82' : '#FF5A5F',
    occupancyAnterior: isDarkMode ? '#4ECDC4' : '#00A699',
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
          occupancyActual: item.occupancy, // Renombrar para claridad
          occupancyAnterior: compareItem ? compareItem.occupancy : 0
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
            <LineChart
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
                domain={[0, 100]}
                tickFormatter={(value) => percentFormatter(value)}
                tick={{ fill: colors.text }}
                axisLine={{ stroke: colors.grid }}
                tickLine={{ stroke: colors.grid }}
              />
              <Tooltip 
                formatter={(value) => percentFormatter(Number(value))}
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
                  <Line 
                    type="monotone" 
                    dataKey="occupancyActual" 
                    name="Año Actual" 
                    stroke={colors.occupancyActual} 
                    strokeWidth={2}
                    activeDot={{ r: 8, fill: colors.occupancyActual, stroke: 'white', strokeWidth: 2 }} 
                    dot={{ r: 4, fill: colors.occupancyActual, stroke: 'white', strokeWidth: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="occupancyAnterior" 
                    name="Año Anterior" 
                    stroke={colors.occupancyAnterior} 
                    strokeWidth={2}
                    activeDot={{ r: 8, fill: colors.occupancyAnterior, stroke: 'white', strokeWidth: 2 }} 
                    dot={{ r: 4, fill: colors.occupancyAnterior, stroke: 'white', strokeWidth: 1 }}
                  />
                </>
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  name="Ocupación" 
                  stroke={colors.occupancy} 
                  strokeWidth={2}
                  activeDot={{ r: 8, fill: colors.occupancy, stroke: 'white', strokeWidth: 2 }} 
                  dot={{ r: 4, fill: colors.occupancy, stroke: 'white', strokeWidth: 1 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
