import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparativeChartProps {
  title: string;
  data: Array<{
    name: string;
    currentYear: number;
    previousYear: number;
  }>;
  currentYearLabel: string;
  previousYearLabel: string;
  formatter?: (value: number) => string;
}

export const ComparativeChart: React.FC<ComparativeChartProps> = ({
  title,
  data,
  currentYearLabel,
  previousYearLabel,
  formatter = (value) => `${value}`
}) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
              <Bar 
                dataKey="currentYear" 
                name={currentYearLabel} 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="previousYear" 
                name={previousYearLabel} 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
