import { Booking, ApartmentSummary, BookingSource } from '@/types';
import { 
  calculateTotalRevenue, 
  calculateTotalProfit, 
  calculateTotalCommissions, 
  calculateTotalCleaningFees,
  calculateAverageNightlyRate,
  calculateProfitability,
  filterActiveBookings
} from '@/utils/metrics/financialMetrics';
import { calculateOccupancyRate } from '@/utils/filters/bookingFilters';
import { 
  prepareMonthlyData as prepareMonthlySummary, 
  prepareComparativeData,
  calculateApartmentProfitability 
} from '@/utils/data/dataPreparation';

// Export prepareMonthlyData from dataPreparation to be used in other components
export const prepareMonthlyData = prepareMonthlySummary;

/**
 * Calculate Revenue Per Available Room (RevPAR)
 */
export const calculateRevPAR = (bookings: Booking[], apartments: string[]): number => {
  // Filtrar las reservas canceladas
  const activeBookings = filterActiveBookings(bookings);
  const totalRevenue = calculateTotalRevenue(activeBookings);
  // Calculate the total available room-nights in the period
  const totalAvailableRoomNights = apartments.length * 365; // Basic calculation for a year
  
  return totalAvailableRoomNights > 0 ? totalRevenue / totalAvailableRoomNights : 0;
};

/**
 * Calculate Average Daily Rate (ADR)
 */
export const calculateADR = (bookings: Booking[]): number => {
  // Filtrar las reservas canceladas
  const activeBookings = filterActiveBookings(bookings);
  const totalRevenue = calculateTotalRevenue(activeBookings);
  const totalBookedNights = activeBookings.reduce((sum, booking) => sum + booking.nights, 0);
  
  return totalBookedNights > 0 ? totalRevenue / totalBookedNights : 0;
};

/**
 * Generate dashboard metric data based on bookings and filters
 */
export const generateDashboardMetrics = (
  bookings: Booking[], 
  apartments: string[],
  year: number,
  month: string | null = null,
  compareMode: boolean = false,
  compareYear: number | null = null
) => {
  // Filtrar las reservas canceladas
  const activeBookings = filterActiveBookings(bookings);
  
  // Core metrics
  const totalRevenue = calculateTotalRevenue(activeBookings);
  const totalProfit = calculateTotalProfit(activeBookings);
  const totalCleaningFees = calculateTotalCleaningFees(activeBookings);
  const totalCommissions = calculateTotalCommissions(activeBookings);
  const averageNightlyRate = calculateAverageNightlyRate(activeBookings);
  const profitability = calculateProfitability(activeBookings);
  const occupancyRate = calculateOccupancyRate(activeBookings, year, month);
  
  // Advanced metrics
  const revPAR = calculateRevPAR(activeBookings, apartments);
  const adr = calculateADR(activeBookings);
  
  // Monthly and comparative data
  const monthlyData = prepareMonthlyData(activeBookings, year);
  
  // Financial breakdown data
  const breakdownData = [
    { name: "Ingresos", value: totalRevenue },
    { name: "Gastos Limpieza", value: totalCleaningFees },
    { name: "Comisiones", value: totalCommissions },
    { name: "Beneficio", value: totalProfit }
  ];
  
  // Apartment profitability data
  const apartmentData = calculateApartmentProfitability(activeBookings);
  
  // Booking source data
  const bookingSourceData = activeBookings.reduce((acc: any[], booking) => {
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

  // Prepare comparative data if needed
  const compareData = compareMode && compareYear ? {
    monthlyData: [],
    compareRevenue: 0,
    compareProfit: 0,
    revenueChange: 0,
    profitChange: 0,
  } : null;
  
  return {
    totalRevenue,
    totalProfit,
    totalCleaningFees,
    totalCommissions,
    averageNightlyRate,
    profitability,
    occupancyRate,
    revPAR,
    adr,
    monthlyData,
    breakdownData,
    apartmentData,
    bookingSourceData,
    compareData
  };
};

/**
 * Generate apartment summaries
 */
export const generateApartmentSummaries = (
  bookings: Booking[], 
  apartments: string[]
): ApartmentSummary[] => {
  // Filtrar las reservas canceladas a nivel global
  const activeBookings = filterActiveBookings(bookings);
  
  return apartments.map(apartment => {
    const apartmentBookings = activeBookings.filter(booking => booking.apartment === apartment);
    
    const totalRevenue = calculateTotalRevenue(apartmentBookings);
    const totalProfit = calculateTotalProfit(apartmentBookings);
    const totalNights = apartmentBookings.reduce((sum, booking) => sum + booking.nights, 0);
    const avgNightlyRate = calculateAverageNightlyRate(apartmentBookings);
    
    // Calculate occupancy rate for this apartment
    const occupancyRate = totalNights > 0 ? Math.min((totalNights / 365) * 100, 100) : 0;
    
    return {
      name: apartment,
      bookings: apartmentBookings.length,
      totalRevenue,
      averageNightlyRate: avgNightlyRate,
      occupancyRate,
      totalNights,
      averageStay: apartmentBookings.length > 0 ? totalNights / apartmentBookings.length : 0
    };
  });
};

/**
 * Generate booking sources data
 */
export const generateBookingSources = (bookings: Booking[]): BookingSource[] => {
  // Filtrar las reservas canceladas
  const activeBookings = filterActiveBookings(bookings);
  
  const sources: { [key: string]: { bookings: number; revenue: number } } = {};
  
  activeBookings.forEach(booking => {
    if (!sources[booking.bookingPortal]) {
      sources[booking.bookingPortal] = { bookings: 0, revenue: 0 };
    }
    sources[booking.bookingPortal].bookings += 1;
    sources[booking.bookingPortal].revenue += booking.price;
  });
  
  const totalBookings = activeBookings.length;
  
  return Object.keys(sources).map(source => ({
    name: source,
    bookings: sources[source].bookings,
    revenue: sources[source].revenue,
    percentage: totalBookings ? (sources[source].bookings / totalBookings) * 100 : 0
  }));
};

// Re-export the calculation functions for use in components
export { 
  calculateTotalRevenue, 
  calculateTotalProfit,
  calculateTotalCommissions,
  calculateTotalCleaningFees,
  calculateAverageNightlyRate,
  calculateOccupancyRate,
  calculateProfitability,
  filterActiveBookings  // Exportar la función de filtrado
};
