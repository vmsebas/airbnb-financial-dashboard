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
    name: string; // Month name (e.g., "Ene", "Feb")
    [yearKey: string]: number | string; // Revenue for each year, e.g., "2023": 5000, "2024": 6000
  }[];
  title: string;
  yearKeys: string[]; // e.g., ["2023", "2024"]
  yearLabels: Record<string, string>; // e.g., { "2023": "Año 2023", "2024": "Año 2024" }
}

const CHART_COLORS = ['#FF5A5F', '#00A699', '#FFB400', '#007A87', '#8E8CD8', '#FC642D'];

// Eliminamos el formateador local ya que ahora usamos los formateadores centralizados

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title, yearKeys, yearLabels }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const themeColors = {
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    text: isDarkMode ? '#ffffff' : '#333333',
    background: isDarkMode ? '#2d3748' : '#ffffff',
    border: isDarkMode ? '#4a5568' : '#e5e7eb',
  };

  // Los datos ya vienen preparados para múltiples años.
  const chartData = data;
    
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
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: themeColors.text }}
                axisLine={{ stroke: themeColors.grid }}
                tickLine={{ stroke: themeColors.grid }}
              />
              <YAxis 
                tickFormatter={(value) => currencyFormatter.format(value).replace(/[^0-9,.]/g, '')}
                tick={{ fill: themeColors.text }}
                axisLine={{ stroke: themeColors.grid }}
                tickLine={{ stroke: themeColors.grid }}
              />
              <Tooltip 
                formatter={(value) => currencyFormatter.format(Number(value))}
                contentStyle={{ 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ color: themeColors.text, paddingTop: '10px' }} 
                iconType="circle"
              />
              {yearKeys.map((yearKey, index) => (
                <Bar 
                  key={yearKey}
                  dataKey={yearKey} 
                  name={yearLabels[yearKey] || yearKey} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
