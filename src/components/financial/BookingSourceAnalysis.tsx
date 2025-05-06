
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#FFB400', '#007A87', '#8E8CD8', '#764BA2', '#593C8F'];

interface BookingSourceAnalysisProps {
  bookingSourceData: Array<{
    name: string;
    value: number;
    bookings: number;
  }>;
  formatter: Intl.NumberFormat;
}

export const BookingSourceAnalysis: React.FC<BookingSourceAnalysisProps> = ({ 
  bookingSourceData,
  formatter
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Portal de Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingSourceData.map((entry, index) => (
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
            <CardTitle>Número de Reservas por Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingSourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" name="Reservas" fill="#8E8CD8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Comparativa de Ingresos por Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={bookingSourceData}
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
                />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === "Reservas") return value;
                    return formatter.format(Number(value));
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="value" name="Ingresos" fill="#FF5A5F" />
                <Bar yAxisId="right" dataKey="bookings" name="Reservas" fill="#00A699" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
