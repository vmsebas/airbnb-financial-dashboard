import React, { useState, useEffect } from 'react';
import { DashboardBase } from '@/components/dashboard/DashboardBase';
import { AdminAnalysisDashboard } from '@/components/admin/AdminAnalysisDashboard';
import { useFilters } from '@/context/FilterContext';
import { fetchBookings } from '@/services/airtableService';
import { filterBookings } from '@/utils/filterUtils';
import * as dashboardMetricsService from '@/services/dashboardMetricsService';

const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const AdminDashboard = () => {
  const { appliedFilters } = useFilters();
  const [advancedData, setAdvancedData] = useState({
    revenueData: [],
    profitData: [],
    bookingSourceData: []
  });
  const [loading, setLoading] = useState(true);

  // Load data for advanced analysis components
  useEffect(() => {
    const loadAdvancedData = async () => {
      try {
        setLoading(true);
        
        console.log('[AdminDashboard] Filtros aplicados:', appliedFilters);
        
        // Fetch bookings for current and previous year
        const currentYearBookings = await fetchBookings('admin');
        console.log(`[AdminDashboard] Total de reservas obtenidas: ${currentYearBookings.length}`);
        
        // Filter bookings
        const filteredCurrentBookings = filterBookings(currentYearBookings, appliedFilters);
        console.log(`[AdminDashboard] Reservas filtradas: ${filteredCurrentBookings.length} de ${currentYearBookings.length}`);
        
        if (filteredCurrentBookings.length > 0) {
          console.log('[AdminDashboard] Primeros apartamentos después de filtrar:', 
            filteredCurrentBookings.slice(0, 3).map(b => b.apartment).join(', '));
        }
        
        // Prepare data for the previous year
        const lastYearFilter = {...appliedFilters, year: appliedFilters.year - 1};
        const filteredPreviousBookings = filterBookings(currentYearBookings, lastYearFilter);
        console.log(`[AdminDashboard] Reservas año anterior: ${filteredPreviousBookings.length}`);
        
        // Generate monthly data - using the exported prepareMonthlyData function
        const currentYearData = dashboardMetricsService.prepareMonthlyData(filteredCurrentBookings, appliedFilters.year);
        const previousYearData = dashboardMetricsService.prepareMonthlyData(filteredPreviousBookings, appliedFilters.year - 1);
        
        // Create comparative revenue data
        const revenueData = currentYearData.map((month, index) => {
          const lastYearMonth = previousYearData[index] || { revenue: 0 };
          return {
            name: month.name,
            thisYear: month.revenue,
            lastYear: lastYearMonth.revenue
          };
        });
        
        // Profit data by month
        const profitData = currentYearData.map(month => ({
          name: month.name,
          revenue: month.revenue,
          profit: month.profit
        }));
        
        // Booking source data
        const bookingSourceData = dashboardMetricsService.generateBookingSources(filteredCurrentBookings);
        
        setAdvancedData({
          revenueData,
          profitData,
          bookingSourceData
        });
      } catch (error) {
        console.error("Error loading advanced data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAdvancedData();
  }, [appliedFilters]);

  return (
    <>
      <DashboardBase 
        role="admin"
        title="Panel Administrativo"
        description="Resumen financiero y métricas avanzadas de todos los apartamentos"
        showAdvancedMetrics={true}
      />
      
      {!loading && (
        <AdminAnalysisDashboard 
          revenueData={advancedData.revenueData}
          profitData={advancedData.profitData}
          bookingSourceData={advancedData.bookingSourceData}
          formatter={formatter}
        />
      )}
    </>
  );
};

export default AdminDashboard;
