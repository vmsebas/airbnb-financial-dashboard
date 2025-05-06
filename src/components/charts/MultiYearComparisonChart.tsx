import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Colores para cada año en el gráfico
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'
];

interface MultiYearComparisonChartProps {
  title: string;
  data: Array<any>; // Datos mensuales con valores para múltiples años
  yearLabels: {[key: string]: string}; // Etiquetas para cada año (ej: {'2023': '2023', '2022': '2022'})
  formatter?: (value: number) => string;
}

export const MultiYearComparisonChart: React.FC<MultiYearComparisonChartProps> = ({
  title,
  data,
  yearLabels,
  formatter = (value) => `${value}`
}) => {
  // Obtener las claves de años para renderizar las barras
  const yearKeys = Object.keys(yearLabels);
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatter} />
              <Tooltip formatter={(value: any) => formatter(value)} />
              <Legend />
              
              {/* Renderizar una barra para cada año */}
              {yearKeys.map((yearKey, index) => (
                <Bar 
                  key={yearKey}
                  dataKey={yearKey} 
                  name={yearLabels[yearKey]} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
