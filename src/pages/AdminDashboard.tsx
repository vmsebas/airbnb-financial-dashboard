import React, { useState, useEffect } from 'react';
import { AdminAnalysisDashboard } from '@/components/admin/AdminAnalysisDashboard';
import { useFilters } from '@/context/FilterContext';
import { fetchBookings } from '@/services/airtableService';
import { filterBookings } from '@/utils/filterUtils';
import * as dashboardMetricsService from '@/services/dashboardMetricsService';
import { MultiYearComparisonChart } from '@/components/charts/MultiYearComparisonChart';
import { ComparativeMetricCard } from '@/components/dashboard/ComparativeMetricCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { currencyFormatter, percentFormatter } from '@/utils/formatters';

const AdminDashboard = () => {
  const { appliedFilters } = useFilters();
  const [advancedData, setAdvancedData] = useState({
    revenueData: [],
    profitData: [],
    bookingSourceData: []
  });
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<any[]>([]);

  // Para debugging
  useEffect(() => {
    console.log("Valores actuales de los filtros aplicados:", appliedFilters);
    console.log("Modo de comparación:", appliedFilters.compareMode);
    console.log("Años para comparar:", appliedFilters.compareYears);
  }, [appliedFilters]);

  // Load data for advanced analysis components
  useEffect(() => {
    const loadAdvancedData = async () => {
      try {
        setLoading(true);
        
        console.log('[AdminDashboard] Filtros aplicados:', appliedFilters);
        
        // Fetch bookings for current and previous year
        const allBookings = await fetchBookings();
        console.log(`[AdminDashboard] Total de reservas obtenidas: ${allBookings.length}`);
        
        // Filter bookings
        const filteredCurrentBookings = filterBookings(allBookings, appliedFilters);
        console.log(`[AdminDashboard] Reservas filtradas: ${filteredCurrentBookings.length}`);
        
        // Prepare data for revenue chart
        const revenueData = dashboardMetricsService.prepareMonthlyData(filteredCurrentBookings, appliedFilters.year);
        console.log('[AdminDashboard] Datos de ingresos mensuales generados:', revenueData);
        
        // Prepare data for profit chart
        const profitData = dashboardMetricsService.calculateApartmentProfitability(filteredCurrentBookings);
        console.log('[AdminDashboard] Datos de rentabilidad por apartamento generados:', profitData);
        
        // Prepare data for booking source chart
        const bookingSourceData = dashboardMetricsService.generateBookingSources(filteredCurrentBookings);
        console.log('[AdminDashboard] Datos de fuentes de reserva generados:', bookingSourceData);
        
        // Prepare comparison data if in compare mode
        if (appliedFilters.compareMode && appliedFilters.compareYears.length > 0) {
          console.log('[AdminDashboard] Generando datos de comparación para años:', appliedFilters.compareYears);
          
          const comparisonResult = dashboardMetricsService.generateYearlyComparison(
            allBookings,
            appliedFilters.year,
            appliedFilters.compareYears[0]
          );
          
          console.log('[AdminDashboard] Datos de comparación anual generados:', comparisonResult);
          setComparisonData(comparisonResult);
          
          // Generate monthly comparison data
          const monthlyComparison = dashboardMetricsService.generateMultiYearComparison(
            allBookings,
            appliedFilters.year,
            appliedFilters.compareYears
          );
          
          console.log('[AdminDashboard] Datos de comparación mensual generados:', monthlyComparison);
          setMonthlyComparisonData(monthlyComparison);
        } else {
          setComparisonData(null);
          setMonthlyComparisonData([]);
        }
        
        setAdvancedData({
          revenueData,
          profitData,
          bookingSourceData
        });
        
        setLoading(false);
      } catch (error) {
        console.error('[AdminDashboard] Error al cargar datos avanzados:', error);
        setLoading(false);
      }
    };
    
    loadAdvancedData();
  }, [appliedFilters]);
  
  // Create year labels for the comparison chart
  const createYearLabels = (): { [key: string]: string } => {
    if (!comparisonData || !appliedFilters.compareMode || !appliedFilters.compareYears || appliedFilters.compareYears.length === 0) {
      return {};
    }
    const yearsToLabel = [appliedFilters.year, ...appliedFilters.compareYears];
    const labels: { [key: string]: string } = {};
    yearsToLabel.forEach(year => {
      if (year !== undefined && year !== null) { 
        labels[year.toString()] = year.toString(); 
      }
    });
    return labels;
  };

  // Prepare comparison card data
  const prepareComparisonCardData = () => {
    if (!comparisonData) return [];
    
    return comparisonData.comparisonData.map((yearData: any) => ({
      year: yearData.year,
      value: yearData.revenue,
      formattedValue: currencyFormatter.format(yearData.revenue)
    }));
  };

  return (
    <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rental-primary"></div>
            </div>
          ) : (
            <div>
              {/* Sección de comparación anual */}
              {comparisonData && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Comparación Anual</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ComparativeMetricCard
                      title="Ingresos Totales"
                      description="Incluye tarifa base, limpieza, etc."
                      currentYearValue={comparisonData.currentYear.revenue}
                      comparisonData={comparisonData.comparisonData.map((yearData: any) => ({
                        year: yearData.year,
                        value: yearData.revenue,
                        formattedValue: currencyFormatter.format(yearData.revenue)
                      }))}
                      formatValue={(value) => currencyFormatter.format(value)}
                    />
                    
                    <ComparativeMetricCard
                      title="Beneficio Total"
                      description="Ingresos menos gastos"
                      currentYearValue={comparisonData.currentYear.profit}
                      comparisonData={comparisonData.comparisonData.map((yearData: any) => ({
                        year: yearData.year,
                        value: yearData.profit,
                        formattedValue: currencyFormatter.format(yearData.profit)
                      }))}
                      formatValue={(value) => currencyFormatter.format(value)}
                    />
                    
                    <ComparativeMetricCard
                      title="Tasa de Ocupación"
                      description="Porcentaje de días ocupados"
                      currentYearValue={comparisonData.currentYear.occupancyRate}
                      comparisonData={comparisonData.comparisonData.map((yearData: any) => ({
                        year: yearData.year,
                        value: yearData.occupancyRate,
                        formattedValue: percentFormatter(yearData.occupancyRate)
                      }))}
                      formatValue={(value) => percentFormatter(value)}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <MultiYearComparisonChart
                      title={`Comparación de Ingresos Mensuales (${[appliedFilters.year, ...appliedFilters.compareYears].join(' vs ')})`}
                      data={monthlyComparisonData}
                      yearLabels={createYearLabels()}
                      formatter={(value) => currencyFormatter.format(value).replace(/[^0-9,.]/g, '')}
                    />
                  </div>
                </div>
              )}
              
              {/* Dashboard de análisis administrativo */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Análisis Avanzado (Solo Administradores)</h2>
                <AdminAnalysisDashboard 
                  revenueData={advancedData.revenueData}
                  profitData={advancedData.profitData}
                  bookingSourceData={advancedData.bookingSourceData}
                  formatter={currencyFormatter}
                />
              </div>
            </div>
          )}
        </div>
    </MainLayout>
  );
};

export default AdminDashboard;