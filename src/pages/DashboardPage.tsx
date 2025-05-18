import React, { useState, useEffect } from 'react';
import { useFilters } from '@/context/FilterContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { filterBookings } from '@/utils/filters/bookingFilters';
import { fetchBookings, getSourceName } from '@/services/dataRouterService';
import * as dashboardMetricsService from '@/services/dashboardMetricsService';
import { calculateTotalRevenue, calculateTotalProfit } from '@/utils/metrics/financialMetrics';
import { currencyFormatter } from '@/utils/formatters';
import { generateMockBookings } from '@/utils/mockData';

const DashboardPage = () => {
  const { appliedFilters } = useFilters();
  const [advancedData, setAdvancedData] = useState<{
    revenueData: any[];
    profitData: any[];
    bookingChannelData: any[];
  }>({
    revenueData: [],
    profitData: [],
    bookingChannelData: []
  });
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<any[]>([]);
  const [advancedLoading, setAdvancedLoading] = useState(true);
  const [advancedError, setAdvancedError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Valores actuales de los filtros aplicados:", appliedFilters);
    console.log("Modo de comparación:", appliedFilters.compareMode);
    console.log("Años para comparar:", appliedFilters.compareYears);
  }, [appliedFilters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setAdvancedLoading(true);
      setAdvancedError(null);

      console.log('[DashboardPage] Filtros aplicados:', appliedFilters);
      console.log(`[DashboardPage] Fuente de datos actual: ${getSourceName()}`);

      // Intentar obtener datos reales de Airtable primero
      console.log('[DashboardPage] Intentando obtener datos reales de Airtable...');
      
      // Lista de apartamentos conocidos
      const apartmentNames = [
        'Trindade 1 - Yellow Tiles',
        'Trindade 4 - White Tiles',
        'I Love Lisboa',
        'Trindade 2 - Blue Tiles'
      ];
      
      // Obtener reservas para cada apartamento
      let allBookings = [];
      let useMockData = false;
      
      try {
        // Primero intentamos obtener todos los datos de una vez
        console.log('[DashboardPage] Intentando obtener todas las reservas...');
        const bookings = await fetchBookings(false);
        
        if (bookings && bookings.length > 0) {
          console.log(`[DashboardPage] Obtenidas ${bookings.length} reservas reales`);
          allBookings = bookings;
        } else {
          // Si no hay reservas, intentamos obtenerlas por apartamento
          console.log('[DashboardPage] No se obtuvieron reservas. Intentando por apartamento...');
          
          for (const apartmentName of apartmentNames) {
            try {
              console.log(`[DashboardPage] Obteniendo reservas para ${apartmentName}...`);
              const apartmentBookings = await import('@/services/airtableService').then(module => 
                module.fetchBookingsByApartment(apartmentName, false)
              );
              console.log(`[DashboardPage] Obtenidas ${apartmentBookings.length} reservas para ${apartmentName}`);
              allBookings = [...allBookings, ...apartmentBookings];
            } catch (apartmentError) {
              console.error(`[DashboardPage] Error al obtener reservas para ${apartmentName}:`, apartmentError);
            }
          }
        }
        
        // Si después de intentar ambos métodos no hay reservas, usamos datos de muestra
        if (allBookings.length === 0) {
          console.log('[DashboardPage] No se pudieron obtener datos reales. Usando datos de muestra...');
          useMockData = true;
        }
      } catch (error) {
        console.error('[DashboardPage] Error al obtener datos reales:', error);
        useMockData = true;
      }
      
      // Si es necesario, generamos datos de muestra
      if (useMockData) {
        console.log('[DashboardPage] Generando datos de muestra como último recurso...');
        const { generateMockBookings } = await import('@/utils/mockData');
        
        allBookings = [];
        for (const apartmentName of apartmentNames) {
          console.log(`[DashboardPage] Generando datos de muestra para ${apartmentName}...`);
          const mockBookings = generateMockBookings(20, apartmentName); // 20 reservas por apartamento
          console.log(`[DashboardPage] Generadas ${mockBookings.length} reservas de muestra para ${apartmentName}`);
          allBookings = [...allBookings, ...mockBookings];
        }
        
        console.log(`[DashboardPage] Total de reservas de muestra generadas: ${allBookings.length}`);
      } else {
        console.log(`[DashboardPage] Usando ${allBookings.length} reservas reales de Airtable`);
      }
      
      // Generar algunos datos de muestra si no hay reservas
      let filteredCurrentBookings;
      if (!allBookings || allBookings.length === 0) {
        console.warn('[DashboardPage] IMPORTANTE: Se están usando datos de muestra porque no hay reservas reales');
        // Generar reservas de muestra con varios portales
        const mockBookings = generateMockBookings(30);
        // Modificar algunos datos para tener variedad
        mockBookings.forEach((booking, index) => {
          // Distribuir los portales para tener estadísticas interesantes
          booking.bookingPortal = ['Airbnb', 'Booking.com', 'Directo', 'Vrbo'][index % 4];
          booking.price = 100 + Math.floor(Math.random() * 200); // Entre 100 y 300
          booking.nights = 1 + Math.floor(Math.random() * 7); // Entre 1 y 7 noches
          booking.year = appliedFilters.year || new Date().getFullYear();
          booking.apartment = ['Trindade 1 - Yellow Tiles', 'Trindade 4 - White Tiles', 'I Love Lisboa', 'Trindade 2 - Blue Tiles'][index % 4];
          // Añadir estado activo para que no sean filtradas
          booking.status = 'Confirmada';
          // Añadir valores para profit, commission y cleaningFee
          booking.profit = booking.price * 0.7; // 70% de beneficio
          booking.commission = booking.price * 0.15; // 15% de comisión
          booking.cleaningFee = 50; // Tarifa fija de limpieza
        });
        console.log('[DashboardPage] Datos de muestra generados:', mockBookings.slice(0, 2));
        filteredCurrentBookings = filterBookings(mockBookings, appliedFilters);
      } else {
        console.log('[DashboardPage] Aplicando filtros a las reservas:', appliedFilters);
        // Verificar si las reservas tienen los campos necesarios
        const missingFields = {};
        allBookings.forEach(booking => {
          if (booking.price === undefined) missingFields.price = (missingFields.price || 0) + 1;
          if (booking.profit === undefined) missingFields.profit = (missingFields.profit || 0) + 1;
          if (booking.nights === undefined) missingFields.nights = (missingFields.nights || 0) + 1;
          if (booking.status === undefined) missingFields.status = (missingFields.status || 0) + 1;
          if (booking.apartment === undefined) missingFields.apartment = (missingFields.apartment || 0) + 1;
        });
        
        if (Object.keys(missingFields).length > 0) {
          console.warn('[DashboardPage] ⚠️ ADVERTENCIA: Algunas reservas tienen campos faltantes:', missingFields);
        }
        
        filteredCurrentBookings = filterBookings(allBookings, appliedFilters);
      }
      console.log(`[DashboardPage] Reservas filtradas: ${filteredCurrentBookings.length}`);
      console.log('[DashboardPage] Muestra de reservas filtradas:', filteredCurrentBookings.slice(0, 2));

      console.log('[DashboardPage] Preparando datos de ingresos mensuales...');
      const revenueDataForChart = dashboardMetricsService.prepareMonthlyData(filteredCurrentBookings, appliedFilters.year);
      console.log('[DashboardPage] Datos de ingresos mensuales generados:', revenueDataForChart);

      console.log('[DashboardPage] Calculando rentabilidad por apartamento...');
      const profitDataForChart = dashboardMetricsService.calculateApartmentProfitability(filteredCurrentBookings);
      console.log('[DashboardPage] Datos de rentabilidad por apartamento generados:', profitDataForChart);
      
      console.log('[DashboardPage] Generando datos de portales de reserva...');
      const bookingChannelDataForChart = dashboardMetricsService.generateBookingSources(filteredCurrentBookings);
      console.log('[DashboardPage] Datos de portales de reserva generados:', bookingChannelDataForChart);

      setAdvancedData({
        revenueData: revenueDataForChart,
        profitData: profitDataForChart,
        bookingChannelData: bookingChannelDataForChart,
      });

      if (appliedFilters.compareMode && appliedFilters.compareYears.length > 0) {
        console.log('[DashboardPage] Generando datos de comparación para años:', appliedFilters.compareYears);

        const baseFilteredBookings = filterBookings(allBookings, {
          ...appliedFilters,
          year: null,
          compareMode: false,
          compareYears: []
        });

        console.log(`[DashboardPage] Reservas filtradas por apartamento y otros criterios (sin año): ${baseFilteredBookings.length}`);
        
        const comparisonResults = await dashboardMetricsService.generateMultiYearComparison(
          allBookings || [], 
          appliedFilters.year, 
          appliedFilters.compareYears
        );

        if (comparisonResults) {
          // Calcular ingresos reales a partir de las reservas disponibles
          const realRevenue = allBookings && allBookings.length > 0 ? calculateTotalRevenue(allBookings) : 0;
          const realProfit = allBookings && allBookings.length > 0 ? calculateTotalProfit(allBookings) : 0;
          
          console.log('[DashboardPage] Ingresos reales calculados:', realRevenue);
          
          setComparisonData(comparisonResults.currentYear ? comparisonResults : {
            currentYear: {
              year: appliedFilters.year,
              revenue: realRevenue > 0 ? realRevenue : 15000, // Usar ingresos reales si están disponibles
              profit: realProfit > 0 ? realProfit : 9000,     // Usar ganancias reales si están disponibles
              occupancyRate: 0.75,
              adr: 120,
              revPAR: 90,
              bookings: allBookings ? allBookings.length : 25,
              nights: 75
            }
          });
          setMonthlyComparisonData(comparisonResults.monthlyComparison || []);
        }
        console.log('[DashboardPage] Datos de comparación generados:', comparisonResults);
      } else {
        setComparisonData(null);
        setMonthlyComparisonData([]);
      }
    } catch (error: any) {
      console.error('[DashboardPage] Error detallado al cargar datos del dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[DashboardPage] Error message:', errorMessage);
      if (error.stack) {
        console.error('[DashboardPage] Error stack:', error.stack);
      }
      setAdvancedError(`Error al cargar análisis avanzados: ${errorMessage || 'Error desconocido.'}`);
    } finally {
      setLoading(false);
      setAdvancedLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [appliedFilters]);

  const createYearLabels = (): { [key: string]: string } => {
    if (!comparisonData || !comparisonData.currentYear || !comparisonData.comparisonData) {
      return {};
    }

    const labels: { [key: string]: string } = {};

    labels[String(comparisonData.currentYear.year)] = String(comparisonData.currentYear.year);

    comparisonData.comparisonData.forEach((yearData: any) => {
      if (yearData && yearData.year) {
        labels[String(yearData.year)] = String(yearData.year);
      }
    });

    console.log("[DashboardPage] Etiquetas de año generadas:", labels);
    return labels;
  };

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
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financiero</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen de rendimiento financiero y métricas clave.</p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando datos del dashboard...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Visualización de principales métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ingresos</h4>
                <p className="text-2xl font-bold mt-2">
                  {comparisonData && comparisonData.currentYear && comparisonData.currentYear.revenue 
                    ? currencyFormatter.format(comparisonData.currentYear.revenue)
                    : currencyFormatter.format(0)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ganancias</h4>
                <p className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
                  {advancedData.profitData && advancedData.profitData.length > 0
                    ? currencyFormatter.format(advancedData.profitData.reduce((sum, item) => sum + (item.value || 0), 0))
                    : currencyFormatter.format(0)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Noches Reservadas</h4>
                <p className="text-2xl font-bold mt-2">
                  {comparisonData?.currentYear?.nights || 0}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasa de Ocupación</h4>
                <p className="text-2xl font-bold mt-2">
                  {comparisonData?.currentYear?.occupancyRate 
                    ? `${(comparisonData.currentYear.occupancyRate * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
            
            {/* Gráficos de rendimiento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-4">Ingresos por Mes</h3>
                <div className="h-64">
                  {comparisonData?.currentYear?.monthlyData ? (
                    <div className="text-center text-gray-500">
                      Gráfico de ingresos mensuales
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-4">Distribución por Portal de Reserva</h3>
                <div className="h-64">
                  {advancedData.bookingChannelData && advancedData.bookingChannelData.length > 0 ? (
                    <div className="text-center text-gray-500">
                      Gráfico de distribución por portal
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Comparación anual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">ADR (Tarifa Media Diaria)</h3>
                <p className="text-2xl font-bold mt-1">
                  {comparisonData?.currentYear?.adr 
                    ? currencyFormatter.format(comparisonData.currentYear.adr)
                    : currencyFormatter.format(0)}
                </p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">RevPAR</h3>
                <p className="text-2xl font-bold mt-1">
                  {comparisonData?.currentYear?.revPAR 
                    ? currencyFormatter.format(comparisonData.currentYear.revPAR)
                    : currencyFormatter.format(0)}
                </p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Total Reservas</h3>
                <p className="text-2xl font-bold mt-1">{comparisonData?.currentYear?.bookings || 0}</p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Año Actual</h3>
                <p className="text-2xl font-bold mt-1">{appliedFilters.year || new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Datos por apartamento */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mt-4">
              <h2 className="text-xl font-bold mb-4">Rendimiento por Apartamento</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apartamento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ingresos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ocupación</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reservas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {advancedData.profitData && advancedData.profitData.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">{item.name || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{currencyFormatter.format(item.value || 0)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.occupancy ? `${(item.occupancy * 100).toFixed(1)}%` : '0%'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.bookings || 0}</td>
                      </tr>
                    ))}
                    {(!advancedData.profitData || advancedData.profitData.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          No hay datos disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;