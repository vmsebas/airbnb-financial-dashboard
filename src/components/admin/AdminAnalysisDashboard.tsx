import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#FFB400', '#007A87', '#8E8CD8', '#764BA2', '#593C8F'];

interface AdminAnalysisDashboardProps {
  revenueData: any[];
  profitData: any[];
  bookingSourceData: any[];
  formatter: Intl.NumberFormat;
  compareMode?: boolean;
  compareYear?: number | null;
}

export const AdminAnalysisDashboard: React.FC<AdminAnalysisDashboardProps> = ({ 
  revenueData, 
  profitData, 
  bookingSourceData, 
  formatter,
  compareMode = false,
  compareYear = null
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Análisis Avanzado (Solo Administradores)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">Análisis de Ingresos</TabsTrigger>
            <TabsTrigger value="profit">Análisis de Rentabilidad</TabsTrigger>
            <TabsTrigger value="sources">Análisis de Fuentes de Reserva</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')} />
                  <Tooltip formatter={(value: any) => formatter.format(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="thisYear" name="Este Año" stroke="#FF5A5F" strokeWidth={2} />
                  <Line type="monotone" dataKey="lastYear" name="Año Anterior" stroke="#00A699" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="profit">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')} />
                  <Tooltip formatter={(value: any) => formatter.format(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Ingresos" fill="#FF5A5F" />
                  <Bar dataKey="profit" name="Beneficio" fill="#00A699" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="sources">
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
                  <Tooltip formatter={(value: any) => formatter.format(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
