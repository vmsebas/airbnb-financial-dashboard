
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Booking } from '@/types';

const COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#FFB400', '#007A87', '#8E8CD8', '#764BA2', '#593C8F'];

interface FinancialOverviewProps {
  breakdownData: Array<{name: string; value: number}>;
  monthlyData: Array<any>;
  formatter: Intl.NumberFormat;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ 
  breakdownData, 
  monthlyData,
  formatter 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desglose Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatter.format(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatter.format(Number(value))}
                    labelFormatter={(label) => monthlyData.find(m => m.name === label)?.fullName || label}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Ingresos" 
                    stroke="#FF5A5F" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Beneficio" 
                    stroke="#00A699" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos y Comisiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
                />
                <Tooltip 
                  formatter={(value: any) => formatter.format(Number(value))}
                  labelFormatter={(label) => monthlyData.find(m => m.name === label)?.fullName || label}
                />
                <Legend />
                <Bar dataKey="cleaningFees" name="Gastos de Limpieza" fill="#FC642D" />
                <Bar dataKey="commissions" name="Comisiones" fill="#FFB400" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
