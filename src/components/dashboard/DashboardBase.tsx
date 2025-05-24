import React, { useState, useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardLoadingState } from '@/components/dashboard/DashboardLoadingState';
import { DashboardErrorState } from '@/components/dashboard/DashboardErrorState';
import { BasicMetrics } from '@/components/dashboard/BasicMetrics';
import { AdvancedMetrics } from '@/components/dashboard/AdvancedMetrics';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardData } from '@/components/dashboard/DashboardData';
import { 
  BasicMetricsSkeleton, 
  AdvancedMetricsSkeleton, 
  DashboardChartsSkeleton 
} from '@/components/dashboard/SkeletonLoaders';

// Define properties for the dashboard
interface DashboardBaseProps {
  role: 'admin' | 'user';
  title: string;
  description: string;
  showAdvancedMetrics?: boolean;
  compareMode?: boolean;
  compareData?: any; // Datos de comparación
}

// Format currency values
const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

export const DashboardBase: React.FC<DashboardBaseProps> = ({ 
  role, 
  title, 
  description,
  showAdvancedMetrics = false,
  compareMode = false,
  compareData = null
}) => {
  const { 
    loading, 
    error, 
    metrics, 
    apartmentSummaries, 
    bookingSources,
    partialData // Datos parciales para mostrar mientras se cargan los completos
  } = useDashboardData(role);
  
  // Estados para controlar la carga progresiva de cada sección
  const [basicMetricsLoaded, setBasicMetricsLoaded] = useState(false);
  const [advancedMetricsLoaded, setAdvancedMetricsLoaded] = useState(false);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Efecto para simular la carga progresiva de componentes
  useEffect(() => {
    if (!loading && metrics) {
      // Cargar componentes progresivamente
      const basicMetricsTimer = setTimeout(() => setBasicMetricsLoaded(true), 100);
      const advancedMetricsTimer = setTimeout(() => setAdvancedMetricsLoaded(true), 300);
      const chartsTimer = setTimeout(() => setChartsLoaded(true), 500);
      const dataTimer = setTimeout(() => setDataLoaded(true), 700);
      
      // Limpiar timers al desmontar
      return () => {
        clearTimeout(basicMetricsTimer);
        clearTimeout(advancedMetricsTimer);
        clearTimeout(chartsTimer);
        clearTimeout(dataTimer);
      };
    }
  }, [loading, metrics]);
  
  // Si hay un error, mostrar el estado de error
  if (error) {
    return (
      <DashboardErrorState 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }
  
  // Si está cargando y no hay datos parciales, mostrar el estado de carga completo
  if (loading && !partialData) {
    return <DashboardLoadingState />;
  }
  
  // Usar datos parciales o completos según corresponda
  const displayMetrics = !loading ? metrics : partialData?.metrics;
  const displayApartmentSummaries = !loading ? apartmentSummaries : partialData?.apartmentSummaries;
  const displayBookingSources = !loading ? bookingSources : partialData?.bookingSources;
  
  // Si no hay métricas disponibles (ni completas ni parciales), mostrar el estado de carga
  if (!displayMetrics) {
    return <DashboardLoadingState />;
  }
  
  const { 
    totalRevenue, 
    totalProfit, 
    totalCleaningFees, 
    averageNightlyRate,
    occupancyRate,
    revPAR,
    adr,
    monthlyData,
  } = displayMetrics;
  
  // Calculate profitability percentage
  const profitability = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rental-dark dark:text-white">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      
      {/* Basic Metrics */}
      {(basicMetricsLoaded || !loading) ? (
        <BasicMetrics 
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          averageNightlyRate={averageNightlyRate}
          totalCleaningFees={totalCleaningFees}
          formatter={formatter}
          compareMode={compareMode}
          compareData={compareData}
        />
      ) : (
        <BasicMetricsSkeleton />
      )}
      
      {/* Advanced Metrics - Only shown for admin or if explicitly enabled */}
      {showAdvancedMetrics && (
        (advancedMetricsLoaded || !loading) ? (
          <AdvancedMetrics 
            revPAR={revPAR}
            adr={adr}
            occupancyRate={occupancyRate}
            profitability={profitability}
            formatter={formatter}
            compareMode={compareMode}
            compareData={compareData}
          />
        ) : (
          <AdvancedMetricsSkeleton />
        )
      )}
      
      {/* Charts */}
      {(chartsLoaded || !loading) ? (
        <DashboardCharts 
          monthlyRevenueData={monthlyData}
          occupancyData={monthlyData}
          compareMode={compareMode}
          compareData={compareData}
        />
      ) : (
        <DashboardChartsSkeleton />
      )}
      
      {/* Apartment List and Booking Sources */}
      {(dataLoaded || !loading) && displayApartmentSummaries && displayBookingSources && (
        <DashboardData 
          apartments={displayApartmentSummaries}
          sources={displayBookingSources}
        />
      )}
    </>
  );
};
