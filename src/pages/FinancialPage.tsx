
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFilters } from '@/context/FilterContext';
import { fetchBookings } from '@/services/airtableService';
import { Booking } from '@/types';
import { 
  filterBookings, 
  calculateTotalRevenue, 
  calculateTotalProfit, 
  calculateTotalCommissions,
  calculateTotalCleaningFees, 
  calculateProfitability,
  prepareMonthlyData,
  prepareComparativeData,
  calculateApartmentProfitability
} from '@/utils/filterUtils';
// Import calculateOccupancyRate directly from its source file to avoid ambiguity
import { calculateOccupancyRate } from '@/utils/filters/bookingFilters';

import { FinancialMetrics } from '@/components/financial/FinancialMetrics';
import { FinancialOverview } from '@/components/financial/FinancialOverview';
import { MonthlyAnalysis } from '@/components/financial/MonthlyAnalysis';
import { ApartmentAnalysis } from '@/components/financial/ApartmentAnalysis';
import { BookingSourceAnalysis } from '@/components/financial/BookingSourceAnalysis';

const FinancialPage = () => {
  const { appliedFilters } = useFilters();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  const percentFormatter = new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await fetchBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
        setError('Error al cargar datos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBookings();
  }, []);
  
  // Aplicar filtros a las reservas
  const filteredBookings = filterBookings(bookings, appliedFilters);
  
  // Aplicar filtros a las reservas para comparación
  const compareFilters = appliedFilters.compareMode && appliedFilters.compareYear ? 
    { ...appliedFilters, year: appliedFilters.compareYear } : appliedFilters;
  const comparisonBookings = appliedFilters.compareMode ? filterBookings(bookings, compareFilters) : [];
  
  // Calcular métricas financieras
  const totalRevenue = calculateTotalRevenue(filteredBookings);
  const totalProfit = calculateTotalProfit(filteredBookings);
  const totalCleaningFees = calculateTotalCleaningFees(filteredBookings);
  const totalCommissions = calculateTotalCommissions(filteredBookings);
  const profitability = calculateProfitability(filteredBookings);
  const occupancyRate = calculateOccupancyRate(filteredBookings, appliedFilters.year, appliedFilters.month);
  
  // Calcular métricas de comparación
  const compareRevenue = calculateTotalRevenue(comparisonBookings);
  const compareProfit = calculateTotalProfit(comparisonBookings);
  const revenueChange = compareRevenue ? ((totalRevenue - compareRevenue) / compareRevenue) * 100 : 0;
  const profitChange = compareProfit ? ((totalProfit - compareProfit) / compareProfit) * 100 : 0;
  
  // Preparar datos mensuales
  const monthlyData = prepareMonthlyData(bookings, appliedFilters.year);
  
  // Preparar datos mensuales de comparación si está activado el modo comparativo
  const compareMonthlyData = appliedFilters.compareMode && appliedFilters.compareYear 
    ? prepareMonthlyData(bookings, appliedFilters.compareYear)
    : [];
  
  // Datos comparativos
  const comparativeData = prepareComparativeData(monthlyData, compareMonthlyData);
  
  // Calcular datos por apartamento
  const apartmentData = calculateApartmentProfitability(filteredBookings);

  // Datos de desglose financiero
  const breakdownData = [
    { name: "Ingresos", value: totalRevenue },
    { name: "Gastos Limpieza", value: totalCleaningFees },
    { name: "Comisiones", value: totalCommissions },
    { name: "Beneficio", value: totalProfit }
  ];
  
  // Datos por portal de reserva
  const bookingSourceData = filteredBookings.reduce((acc: any[], booking) => {
    const existingSource = acc.find(source => source.name === booking.bookingPortal);
    
    if (existingSource) {
      existingSource.value += booking.price;
      existingSource.bookings += 1;
    } else {
      acc.push({
        name: booking.bookingPortal || 'Desconocido',
        value: booking.price,
        bookings: 1
      });
    }
    
    return acc;
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Cargando datos financieros...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rental-dark">Análisis Financiero</h1>
        <p className="text-gray-500">Panel financiero detallado con métricas clave de rendimiento</p>
      </div>
      
      <FinancialMetrics 
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        profitability={profitability}
        occupancyRate={occupancyRate}
        revenueChange={revenueChange}
        profitChange={profitChange}
        filters={appliedFilters}
        formatter={formatter}
        percentFormatter={percentFormatter}
      />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="monthly">Análisis Mensual</TabsTrigger>
          <TabsTrigger value="apartments">Por Apartamento</TabsTrigger>
          <TabsTrigger value="booking-sources">Por Portales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FinancialOverview 
            breakdownData={breakdownData} 
            monthlyData={monthlyData} 
            formatter={formatter} 
          />
        </TabsContent>
        
        <TabsContent value="monthly">
          <MonthlyAnalysis 
            comparativeData={comparativeData} 
            monthlyData={monthlyData} 
            filters={appliedFilters} 
            formatter={formatter} 
          />
        </TabsContent>
        
        <TabsContent value="apartments">
          <ApartmentAnalysis 
            apartmentData={apartmentData} 
            formatter={formatter} 
          />
        </TabsContent>
        
        <TabsContent value="booking-sources">
          <BookingSourceAnalysis 
            bookingSourceData={bookingSourceData} 
            formatter={formatter} 
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default FinancialPage;
