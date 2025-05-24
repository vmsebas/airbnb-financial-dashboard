
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
  ResponsiveContainer
} from 'recharts';

interface ApartmentAnalysisProps {
  apartmentData: Array<any>;
  formatter: Intl.NumberFormat;
}

export const ApartmentAnalysis: React.FC<ApartmentAnalysisProps> = ({ 
  apartmentData,
  formatter
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Apartamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={apartmentData} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  width={120}
                />
                <Tooltip formatter={(value: any) => formatter.format(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" name="Ingresos" fill="#FF5A5F" />
                <Bar dataKey="profit" name="Beneficio" fill="#00A699" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidad por Apartamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apartmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
                  <Bar dataKey="profitability" name="Rentabilidad" fill="#8E8CD8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Apartamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apartmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis 
                    tickFormatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
                  />
                  <Tooltip formatter={(value: any) => formatter.format(Number(value))} />
                  <Legend />
                  <Bar dataKey="cleaningFees" name="Limpieza" fill="#FC642D" />
                  <Bar dataKey="commissions" name="Comisiones" fill="#FFB400" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
