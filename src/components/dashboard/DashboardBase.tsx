import React, { useState, useEffect, ReactNode } from 'react';
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
  role?: 'admin' | 'user';
  title?: string;
  description?: string;
  showAdvancedMetrics?: boolean;
  compareMode?: boolean;
  primaryMonthlyData?: any[];
  primaryYearLabel?: string;
  comparisonYearsMonthlyData?: any[];
  children?: ReactNode;
}

export const DashboardBase: React.FC<DashboardBaseProps> = ({ 
  role, 
  title, 
  description,
  showAdvancedMetrics = false,
  compareMode = false,
  primaryMonthlyData,
  primaryYearLabel,
  comparisonYearsMonthlyData,
  children
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
    monthlyData, // Datos del año "actual" o único año
  } = displayMetrics;

  // Preparar datos específicamente para RevenueChart con posible comparación multi-anual
  let processedMonthlyRevenueData: any[] = [];
  let revenueYearKeys: string[] = [];
  let revenueYearLabels: Record<string, string> = {};

  // Utilizar monthlyData de displayMetrics como base si primaryMonthlyData no está disponible en modo comparación
  const baseMonthlyData = (compareMode && primaryMonthlyData) ? primaryMonthlyData : displayMetrics.monthlyData;

  if (compareMode && primaryMonthlyData && comparisonYearsMonthlyData && comparisonYearsMonthlyData.length > 0) {
    // Modo comparación multianual
    const primaryYearKey = `revenue${primaryYearLabel || 'Current'}`;
    revenueYearKeys.push(primaryYearKey);
    revenueYearLabels[primaryYearKey] = primaryYearLabel || 'Año Actual';

    comparisonYearsMonthlyData.forEach(compYearData => {
      if (compYearData && compYearData.year && compYearData.monthlyData) {
        const compYearKey = `revenue${compYearData.year}`;
        revenueYearKeys.push(compYearKey);
        revenueYearLabels[compYearKey] = compYearData.year.toString();
      }
    });

    processedMonthlyRevenueData = baseMonthlyData.map((currentMonth: any) => {
      const monthData: any = { name: currentMonth.name };
      monthData[primaryYearKey] = currentMonth.revenue;

      comparisonYearsMonthlyData.forEach(compYearData => {
        if (compYearData && compYearData.year && compYearData.monthlyData) {
          const compYearKey = `revenue${compYearData.year}`;
          const comparisonMonth = compYearData.monthlyData.find((pm: any) => pm.name === currentMonth.name);
          monthData[compYearKey] = comparisonMonth ? comparisonMonth.revenue : 0;
        }
      });
      return monthData;
    });

  } else {
    // Modo normal (un solo año) o datos de comparación incompletos
    const singleYearKey = 'revenue';
    revenueYearKeys = [singleYearKey];
    revenueYearLabels = { [singleYearKey]: primaryYearLabel || 'Ingresos' }; 
    
    processedMonthlyRevenueData = baseMonthlyData.map((currentMonth: any) => ({
      name: currentMonth.name,
      [singleYearKey]: currentMonth.revenue,
    }));
  }
  
  // Calculate profitability percentage
  const profitability = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Preparar datos de comparación para BasicMetrics y AdvancedMetrics
  // Usaremos el primer año de comparisonYearsMonthlyData si está disponible
  let compareDataForMetrics = null;
  if (compareMode && comparisonYearsMonthlyData && comparisonYearsMonthlyData.length > 0) {
    // Asumimos que el primer elemento de comparisonYearsMonthlyData contiene las métricas agregadas del año de comparación
    // (ej. revenue, profit, averageNightlyRate, etc.) que esperan BasicMetrics y AdvancedMetrics.
    // Esta estructura es la que se define en DashboardPage.tsx para cada elemento de comparisonData.comparisonData
    compareDataForMetrics = comparisonYearsMonthlyData[0];
  }
  
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
          compareData={compareDataForMetrics} // Usar los datos de comparación preparados
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
            compareData={compareDataForMetrics} // Usar los datos de comparación preparados
          />
        ) : (
          <AdvancedMetricsSkeleton />
        )
      )}
      
      {/* Charts */}
      {(chartsLoaded || !loading) ? (
        <DashboardCharts 
          monthlyRevenueData={processedMonthlyRevenueData} // Datos procesados para RevenueChart
          occupancyData={monthlyData} // Datos originales para OccupancyChart
          yearKeys={revenueYearKeys}    // Nuevas props para RevenueChart
          yearLabels={revenueYearLabels}  // Nuevas props para RevenueChart
          compareMode={compareMode} // Se mantiene para OccupancyChart
          compareData={compareDataForMetrics}   // Usar los datos de comparación preparados para OccupancyChart
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
      
      {children}
    </>
  );
};

// Format currency values
const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});
