
import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line
} from 'recharts';

interface UserApartmentPerformanceProps {
  data: any[];
  formatter: Intl.NumberFormat;
}

export const UserApartmentPerformance: React.FC<UserApartmentPerformanceProps> = ({ 
  data, 
  formatter 
}) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
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
              if (name === "Ocupación") return `${Number(value).toFixed(1)}%`;
              return formatter.format(Number(value));
            }}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            name="Ingresos" 
            fill="#00A699" 
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="occupancy" 
            name="Ocupación" 
            stroke="#FF5A5F" 
            yAxisId="right"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartamento</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((apt, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-2 text-sm">{apt.name}</td>
                <td className="px-4 py-2 text-sm">{formatter.format(apt.revenue)}</td>
                <td className="px-4 py-2 text-sm">{apt.occupancy.toFixed(1)}%</td>
                <td className="px-4 py-2 text-sm">{apt.bookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
