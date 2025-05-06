import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRevenueChart } from '@/components/user/UserRevenueChart';
import { UserOccupancyChart } from '@/components/user/UserOccupancyChart';
import { UserApartmentPerformance } from '@/components/user/UserApartmentPerformance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserAnalysisDashboardProps {
  monthlyData: any[];
  apartmentPerformance: any[];
  occupancyTrend: any[];
  formatter: Intl.NumberFormat;
  comparativeData?: any[];
  compareTitlePrefix?: string;
}

export const UserAnalysisDashboard: React.FC<UserAnalysisDashboardProps> = ({
  monthlyData,
  apartmentPerformance,
  occupancyTrend,
  formatter,
  comparativeData = [],
  compareTitlePrefix = "Comparación de Ingresos"
}) => {
  const showComparison = comparativeData && comparativeData.length > 0;
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Ingresos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <UserRevenueChart data={monthlyData} formatter={formatter} />
          </CardContent>
        </Card>
        
        {showComparison && (
          <Card>
            <CardHeader>
              <CardTitle>{compareTitlePrefix}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparativeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')} />
                    <Tooltip formatter={(value: any) => formatter.format(Number(value))} />
                    <Legend />
                    <Bar dataKey="currentYear" name="Año Actual" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previousYear" name="Año Anterior" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Apartamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <UserApartmentPerformance data={apartmentPerformance} formatter={formatter} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ocupación</CardTitle>
            </CardHeader>
            <CardContent>
              <UserOccupancyChart data={occupancyTrend} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
