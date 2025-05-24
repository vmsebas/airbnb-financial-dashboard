import { Booking } from '@/types';
import { 
  calculateTotalRevenue, 
  calculateTotalProfit, 
  calculateTotalCommissions, 
  calculateTotalCleaningFees, 
  calculateOccupancyRate,
  filterActiveBookings
} from '../metrics/financialMetrics';

/**
 * Prepare monthly data for charts
 */
export const prepareMonthlyData = (bookings: Booking[], year: number) => {
  // Filtrar las reservas canceladas
  const activeBookings = filterActiveBookings(bookings);
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthlyData = monthNames.map(month => ({
    name: month.substring(0, 3),
    fullName: month,
    revenue: 0,
    profit: 0,
    bookings: 0,
    occupancy: 0,
    commissions: 0,
    cleaningFees: 0,
    profitability: 0,
  }));
  
  // Filtrar reservas por año
  const yearBookings = activeBookings.filter(booking => booking.year === year);
  
  // Agrupar datos por mes
  yearBookings.forEach(booking => {
    const monthIndex = monthNames.indexOf(booking.month);
    if (monthIndex !== -1) {
      monthlyData[monthIndex].revenue += booking.price;
      monthlyData[monthIndex].profit += booking.profit;
      monthlyData[monthIndex].bookings += 1;
      monthlyData[monthIndex].commissions += booking.commission;
      monthlyData[monthIndex].cleaningFees += booking.cleaningFee;
    }
  });
  
  // Calcular métricas adicionales para cada mes
  monthlyData.forEach((data, index) => {
    // Ocupación
    data.occupancy = calculateOccupancyRate(activeBookings, year, monthNames[index]);
    
    // Rentabilidad
    data.profitability = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
  });
  
  return monthlyData;
};

/**
 * Prepare comparative data between two periods
 */
export const prepareComparativeData = (currentData: any[], previousData: any[]) => {
  return currentData.map((current, index) => {
    const previous = previousData[index] || { 
      revenue: 0, profit: 0, bookings: 0, occupancy: 0, 
      commissions: 0, cleaningFees: 0, profitability: 0 
    };
    
    // Calcular variaciones en porcentaje
    const revenueVariation = previous.revenue ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
    const profitVariation = previous.profit ? ((current.profit - previous.profit) / previous.profit) * 100 : 0;
    const occupancyVariation = previous.occupancy ? ((current.occupancy - previous.occupancy) / previous.occupancy) * 100 : 0;
    
    return {
      ...current,
      previousRevenue: previous.revenue,
      previousProfit: previous.profit,
      previousOccupancy: previous.occupancy,
      revenueVariation,
      profitVariation,
      occupancyVariation
    };
  });
};

/**
 * Calculate data for apartment profitability analysis
 */
export const calculateApartmentProfitability = (bookings: Booking[]) => {
  // Filtrar las reservas canceladas (pero mantener las bloqueadas para contabilizarlas)
  const activeBookings = filterActiveBookings(bookings);
  
  // Obtener lista de apartamentos únicos (incluyendo todos los apartamentos, incluso los que solo tienen noches bloqueadas)
  const apartmentsSet = new Set<string>();
  bookings.forEach(booking => apartmentsSet.add(booking.apartment));
  const apartments = Array.from(apartmentsSet);
  
  return apartments.map(apartment => {
    // Reservas activas (no canceladas ni bloqueadas) para este apartamento
    const apartmentBookings = activeBookings.filter(b => b.apartment === apartment);
    
    // Reservas bloqueadas para este apartamento
    const blockedBookings = bookings.filter(b => 
      b.apartment === apartment && 
      b.status === 'Bloqueado'
    );
    
    const revenue = calculateTotalRevenue(apartmentBookings);
    const profit = calculateTotalProfit(apartmentBookings);
    const commissions = calculateTotalCommissions(apartmentBookings);
    const cleaningFees = calculateTotalCleaningFees(apartmentBookings);
    const totalNights = apartmentBookings.reduce((sum, b) => sum + b.nights, 0);
    const blockedNights = blockedBookings.reduce((sum, b) => sum + b.nights, 0);
    
    // Estructura actualizada para que coincida con lo que espera ApartmentList
    return {
      apartment: apartment,
      bookings: apartmentBookings.length,
      revenue: revenue,
      profit: profit,
      nights: totalNights,
      blockedNights: blockedNights,
      profitability: revenue > 0 ? (profit / revenue) * 100 : 0,
      revenuePerNight: totalNights > 0 ? revenue / totalNights : 0,
      profitPerNight: totalNights > 0 ? profit / totalNights : 0
    };
  });
};
