import { useState, useEffect } from 'react';
import { fetchBookings, fetchUniqueApartments } from '@/services/airtableService';
import { filterBookings } from '@/utils/filterUtils';
import * as dashboardMetricsService from '@/services/dashboardMetricsService';
import { Booking } from '@/types';
import { useFilters } from '@/context/FilterContext';
import cacheService from '@/services/cacheService';

export function useDashboardData(role: 'admin' | 'user') {
  const { appliedFilters } = useFilters();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apartments, setApartments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [partialData, setPartialData] = useState<any>(null);

  // Cargar datos de caché al inicio
  useEffect(() => {
    const loadCachedData = () => {
      const cacheKey = `dashboard_data_${role}_${JSON.stringify(appliedFilters)}`;
      if (cacheService.has(cacheKey)) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          console.log(`[useDashboardData] Usando datos en caché para ${role}`);
          setPartialData(cachedData);
        }
      }
    };
    
    loadCachedData();
  }, [role, appliedFilters]);

  // Cargar datos frescos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar datos de caché primero para mostrar algo inmediatamente
        const cacheKey = `dashboard_data_${role}_${JSON.stringify(appliedFilters)}`;
        if (cacheService.has(cacheKey)) {
          const cachedData = cacheService.get(cacheKey);
          if (cachedData) {
            console.log(`[useDashboardData] Usando datos en caché para ${role} mientras se cargan datos frescos`);
            setPartialData(cachedData);
          }
        }
        
        // Forzar refresco de datos cuando cambian los filtros de año o fecha
        const useCache = !(
          appliedFilters.year !== undefined || 
          appliedFilters.dateRange.from !== null || 
          appliedFilters.dateRange.to !== null ||
          appliedFilters.compareMode
        );
        
        console.log(`[useDashboardData] Cargando datos con useCache=${useCache}`);
        
        // Cargar datos frescos en segundo plano
        const [fetchedBookings, fetchedApartments] = await Promise.all([
          fetchBookings(role, useCache),
          fetchUniqueApartments(role, useCache)
        ]);
        
        setBookings(fetchedBookings);
        setApartments(fetchedApartments);
        console.log(`${role} Dashboard - Apartamentos cargados:`, fetchedApartments);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [role, appliedFilters]);

  // Filter bookings based on applied filters
  const filteredBookings = filterBookings(bookings, appliedFilters);
  console.log(`${role} Dashboard - Mostrando ${filteredBookings.length} reservas de ${bookings.length} totales`);

  // Filtrar reservas activas (no canceladas)
  const activeBookings = dashboardMetricsService.filterActiveBookings(filteredBookings);

  // Calcular métricas básicas
  const totalRevenue = dashboardMetricsService.calculateTotalRevenue(activeBookings);
  const totalProfit = dashboardMetricsService.calculateTotalProfit(activeBookings);
  const totalCleaningFees = dashboardMetricsService.calculateTotalCleaningFees(activeBookings);
  const averageNightlyRate = dashboardMetricsService.calculateAverageNightlyRate(activeBookings);
  
  // Calcular métricas avanzadas
  const occupancyRate = dashboardMetricsService.calculateOccupancyRate(activeBookings, appliedFilters.year, appliedFilters.month);
  const revPAR = dashboardMetricsService.calculateRevPAR(activeBookings);
  const adr = dashboardMetricsService.calculateADR(activeBookings);
  const profitability = dashboardMetricsService.calculateProfitability(activeBookings);
  
  // Preparar datos mensuales
  const monthlyData = dashboardMetricsService.prepareMonthlyData(activeBookings, appliedFilters.year);
  
  // Get apartment summaries and booking sources
  const apartmentSummaries = dashboardMetricsService.calculateApartmentProfitability(activeBookings);
  const bookingSources = dashboardMetricsService.generateBookingSources(activeBookings);

  // Crear objeto de métricas
  const metrics = {
    totalRevenue,
    totalProfit,
    totalCleaningFees,
    averageNightlyRate,
    occupancyRate,
    revPAR,
    adr,
    profitability,
    monthlyData
  };
  
  // Guardar datos en caché
  useEffect(() => {
    if (!loading && !error && metrics) {
      const cacheKey = `dashboard_data_${role}_${JSON.stringify(appliedFilters)}`;
      const dataToCache = {
        metrics,
        apartmentSummaries,
        bookingSources
      };
      
      cacheService.set(cacheKey, dataToCache);
      console.log(`[useDashboardData] Datos guardados en caché para ${role}`);
    }
  }, [loading, error, metrics, apartmentSummaries, bookingSources, role, appliedFilters]);

  return {
    loading,
    error,
    metrics,
    apartmentSummaries,
    bookingSources,
    apartments,
    filteredBookings: activeBookings, // Devolver solo reservas activas
    partialData
  };
}
