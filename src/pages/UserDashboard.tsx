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
        
        setUserData({
          monthlyData,
          apartmentPerformance,
          occupancyTrend
        });
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [appliedFilters]);

  return (
    <>
      <DashboardBase 
        role="user"
        title="Panel de Usuario"
        description="Resumen financiero de tus apartamentos"
        showAdvancedMetrics={false}
      />
      
      {loading ? (
        <MainLayout>
          <DashboardLoadingState message="Cargando datos específicos del usuario..." />
        </MainLayout>
      ) : (
        <UserAnalysisDashboard 
          monthlyData={userData.monthlyData}
          apartmentPerformance={userData.apartmentPerformance}
          occupancyTrend={userData.occupancyTrend}
          formatter={formatter}
        />
      )}
    </>
  );
};

export default UserDashboard;
