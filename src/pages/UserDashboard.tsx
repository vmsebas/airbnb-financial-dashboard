import React, { useState, useEffect } from 'react';
import { DashboardBase } from '@/components/dashboard/DashboardBase';
import { UserAnalysisDashboard } from '@/components/user/UserAnalysisDashboard';
import { useFilters } from '@/context/FilterContext';
import { fetchBookings } from '@/services/airtableService';
import { filterBookings } from '@/utils/filterUtils';
import * as dashboardMetricsService from '@/services/dashboardMetricsService';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardLoadingState } from '@/components/dashboard/DashboardLoadingState';
import { MultiYearComparisonChart } from '@/components/charts/MultiYearComparisonChart';
import { ComparativeMetricCard } from '@/components/dashboard/ComparativeMetricCard';

const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const UserDashboard = () => {
  const { appliedFilters } = useFilters();
  const { role } = useAuth();
  const [userData, setUserData] = useState({
    monthlyData: [],
    apartmentPerformance: [],
    occupancyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Para debugging
  useEffect(() => {
    console.log("UserDashboard - Valores actuales de los filtros aplicados:", appliedFilters);
    console.log("UserDashboard - Modo de comparación:", appliedFilters.compareMode);
    console.log("UserDashboard - Años para comparar:", appliedFilters.compareYears);
  }, [appliedFilters]);

  // Load user-specific data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        console.log('[UserDashboard] Filtros aplicados:', appliedFilters);
        console.log('[UserDashboard] Rol actual:', role);
        
        // Fetch bookings for user's apartments
        const userBookings = await fetchBookings('user');
        console.log(`[UserDashboard] Total de reservas obtenidas: ${userBookings.length}`);
        
        if (userBookings.length > 0) {
          const apartamentos = [...new Set(userBookings.map(b => b.apartment))];
          console.log('[UserDashboard] Apartamentos disponibles para usuario:', apartamentos);
        }
        
        // Filter bookings based on applied filters
        const filteredBookings = filterBookings(userBookings, appliedFilters);
        console.log(`[UserDashboard] Reservas filtradas: ${filteredBookings.length} de ${userBookings.length}`);
        
        if (filteredBookings.length > 0) {
          console.log('[UserDashboard] Primeros apartamentos después de filtrar:', 
            filteredBookings.slice(0, 3).map(b => b.apartment).join(', '));
        }
        
        // Generate monthly data
        const monthlyData = dashboardMetricsService.prepareMonthlyData(filteredBookings, appliedFilters.year);
        
        // Generate apartment performance data
        const apartmentIds = [...new Set(filteredBookings.map(booking => booking.apartment))];
        
        const apartmentPerformance = apartmentIds.map(apartmentId => {
          const apartmentBookings = filteredBookings.filter(booking => booking.apartment === apartmentId);
          const totalRevenue = dashboardMetricsService.calculateTotalRevenue(apartmentBookings);
          const occupancyRate = dashboardMetricsService.calculateOccupancyRate(
            apartmentBookings, 
            appliedFilters.year, 
            appliedFilters.month
          );
          
          return {
            name: apartmentId,
            revenue: totalRevenue,
            occupancy: occupancyRate,
            bookings: apartmentBookings.length
          };
        });
        
        // Generate occupancy trend data
        const occupancyTrend = monthlyData.map(month => ({
          name: month.name,
          occupancy: month.occupancy
        }));
        
        // Configurar datos de usuario básicos
        setUserData({
          monthlyData,
          apartmentPerformance,
          occupancyTrend
        });
        
        console.log("UserDashboard - CompareMode:", appliedFilters.compareMode);
        console.log("UserDashboard - CompareYears:", appliedFilters.compareYears);
        
        // Procesar datos para comparación de años si hay años seleccionados y el modo comparativo está activado
        if (appliedFilters.compareMode && appliedFilters.compareYears && appliedFilters.compareYears.length > 0) {
          console.log("UserDashboard - Generando datos de comparación entre años");
          
          const multiYearData = dashboardMetricsService.generateMultiYearComparison(
            userBookings,
            appliedFilters.year,
            appliedFilters.compareYears
          );
          
          console.log("UserDashboard - Datos de comparación generados:", multiYearData);
          
          setComparisonData(multiYearData);
        } else {
          setComparisonData(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [appliedFilters, role]);

  // Crear etiquetas para los años en los gráficos
  const createYearLabels = () => {
    const labels: {[key: string]: string} = {
      [String(appliedFilters.year)]: `${appliedFilters.year} (Actual)`
    };
    
    if (appliedFilters.compareYears) {
      appliedFilters.compareYears.forEach(year => {
        labels[String(year)] = `${year}`;
      });
    }
    
    return labels;
  };

  // Preparar datos para las tarjetas de métricas comparativas
  const prepareComparisonCardData = () => {
    if (!comparisonData) return [];
    
    return comparisonData.comparisonData.map((yearData: any) => ({
      year: yearData.year,
      value: yearData.revenue,
      formattedValue: formatter.format(yearData.revenue)
    }));
  };

  return (
    <MainLayout>
      <DashboardBase 
        role="user"
        title="Panel de Usuario"
        description="Resumen financiero de tus apartamentos"
        showAdvancedMetrics={false}
        compareMode={appliedFilters.compareMode}
        compareData={comparisonData}
      />
      
      {loading ? (
        <DashboardLoadingState message="Cargando datos específicos del usuario..." />
      ) : (
        <div className="mt-8">
          {/* Métricas y gráficos comparativos */}
          {appliedFilters.compareMode && comparisonData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComparativeMetricCard
                  title="Ingresos Totales"
                  description="Incluye tarifa base, limpieza, etc."
                  currentYearValue={comparisonData.currentYear.revenue}
                  comparisonData={prepareComparisonCardData()}
                  formatValue={(value) => formatter.format(value)}
                />
                
                <ComparativeMetricCard
                  title="Beneficio Total"
                  description="Ingresos menos comisiones y gastos"
                  currentYearValue={comparisonData.currentYear.profit}
                  comparisonData={comparisonData.comparisonData.map((yearData: any) => ({
                    year: yearData.year,
                    value: yearData.profit,
                    formattedValue: formatter.format(yearData.profit)
                  }))}
                  formatValue={(value) => formatter.format(value)}
                />
                
                <ComparativeMetricCard
                  title="Tasa de Ocupación"
                  description="Porcentaje de días ocupados"
                  currentYearValue={comparisonData.currentYear.occupancy}
                  comparisonData={comparisonData.comparisonData.map((yearData: any) => ({
                    year: yearData.year,
                    value: yearData.occupancy,
                    formattedValue: `${yearData.occupancy.toFixed(1)}%`
                  }))}
                  formatValue={(value) => `${value.toFixed(1)}%`}
                />
              </div>
              
              <div className="mt-6">
                <MultiYearComparisonChart
                  title={`Comparación de Ingresos Mensuales (${[appliedFilters.year, ...appliedFilters.compareYears].join(' vs ')})`}
                  data={comparisonData.monthlyComparisonData}
                  yearLabels={createYearLabels()}
                  formatter={(value) => formatter.format(value).replace(/[^0-9,.]/g, '')}
                />
              </div>
            </div>
          )}
          
          {/* Análisis específico del usuario */}
          <div className="mt-6">
            <UserAnalysisDashboard
              monthlyData={userData.monthlyData}
              apartmentPerformance={userData.apartmentPerformance}
              occupancyTrend={userData.occupancyTrend}
              formatter={formatter}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserDashboard;
