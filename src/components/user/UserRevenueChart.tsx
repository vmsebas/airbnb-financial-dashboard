
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface UserRevenueChartProps {
  data: any[];
  formatter: Intl.NumberFormat;
}

export const UserRevenueChart: React.FC<UserRevenueChartProps> = ({ 
  data, 
  formatter 
}) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
          />
          <Tooltip 
            formatter={(value: any) => formatter.format(Number(value))}
            labelFormatter={(label) => data.find(m => m.name === label)?.fullName || label}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            name="Ingresos" 
            fill="#8884d8" 
          />
          <Bar 
            dataKey="profit" 
            name="Beneficio" 
            fill="#82ca9d" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
