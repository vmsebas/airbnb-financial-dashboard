
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface UserOccupancyChartProps {
  data: any[];
}

export const UserOccupancyChart: React.FC<UserOccupancyChartProps> = ({ data }) => {
  // Calculate average occupancy for reference line
  const avgOccupancy = data.length > 0 
    ? data.reduce((sum, item) => sum + item.occupancy, 0) / data.length 
    : 0;
  
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: any) => `${Number(value).toFixed(1)}%`}
          />
          <Legend />
          <ReferenceLine 
            y={avgOccupancy} 
            label={`Media: ${avgOccupancy.toFixed(1)}%`} 
            stroke="#FF8042" 
            strokeDasharray="3 3" 
          />
          <Line 
            type="monotone" 
            dataKey="occupancy" 
            name="Ocupación" 
            stroke="#FF5A5F" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
