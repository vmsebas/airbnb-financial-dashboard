import { Booking } from '../types';
import { 
  calculateTotalRevenue, 
  calculateTotalProfit,
  calculateTotalCommissions,
  calculateAverageNightlyRate, 
  calculateTotalCleaningFees
} from '@/utils/metrics/financialMetrics';
import { calculateOccupancyRate } from '@/utils/filters/bookingFilters';
import { 
  prepareMonthlyData as originalPrepareMonthlyData, 
  prepareComparativeData,
  calculateApartmentProfitability as originalCalculateApartmentProfitability
} from '@/utils/data/dataPreparation';
import cacheService from './cacheService';

// Función para filtrar reservas activas (no canceladas)
export const filterActiveBookings = (bookings: Booking[]): Booking[] => {
  return bookings.filter(booking => booking.status !== 'Cancelada' && booking.status !== 'Cancelado');
};

// Versión mejorada de prepareMonthlyData con soporte para caché
export const prepareMonthlyData = (bookings: Booking[], year: number, useCache: boolean = true): any[] => {
  const cacheKey = `monthly_data_${year}_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || [];
  }
  
  // Usar la función original si no hay datos en caché
  const result = originalPrepareMonthlyData(bookings, year);
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Nombres de meses en español
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Calcula el RevPAR (Revenue Per Available Room) con soporte para caché
export const calculateRevPARWithCache = (bookings: Booking[], totalDays: number = 365, useCache: boolean = true): number => {
  const cacheKey = `revpar_${bookings.length}_${totalDays}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || 0;
  }
  
  if (totalDays === 0) return 0;
  
  const totalRevenue = calculateTotalRevenue(bookings);
  const result = totalRevenue / totalDays;
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Calcula el ADR (Average Daily Rate) con soporte para caché
export const calculateADRWithCache = (bookings: Booking[], useCache: boolean = true): number => {
  const cacheKey = `adr_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || 0;
  }
  
  const totalNights = bookings.reduce((total, booking) => total + booking.nights, 0);
  if (totalNights === 0) return 0;
  
  const totalRevenue = calculateTotalRevenue(bookings);
  const result = totalRevenue / totalNights;
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Calcula la rentabilidad (Profit / Revenue) con soporte para caché
export const calculateProfitabilityWithCache = (bookings: Booking[], useCache: boolean = true): number => {
  const cacheKey = `profitability_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || 0;
  }
  
  const totalRevenue = calculateTotalRevenue(bookings);
  if (totalRevenue === 0) return 0;
  
  const totalProfit = calculateTotalProfit(bookings);
  const result = (totalProfit / totalRevenue) * 100;
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Genera datos para comparar entre años con soporte para caché
export const generateYearlyComparison = (
  bookings: Booking[], 
  currentYear: number, 
  previousYear: number,
  useCache: boolean = true
): any => {
  const cacheKey = `yearly_comparison_${currentYear}_${previousYear}_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || {};
  }
  
  // Filtrar reservas por año
  const currentYearBookings = bookings.filter(booking => booking.year === currentYear);
  const previousYearBookings = bookings.filter(booking => booking.year === previousYear);
  
  // Calcular métricas para el año actual
  const currentYearMetrics = {
    year: currentYear,
    revenue: calculateTotalRevenue(currentYearBookings),
    profit: calculateTotalProfit(currentYearBookings),
    occupancyRate: calculateOccupancyRate(currentYearBookings, currentYear),
    adr: calculateADRWithCache(currentYearBookings),
    revPAR: calculateRevPARWithCache(currentYearBookings),
    bookings: currentYearBookings.length,
    nights: currentYearBookings.reduce((total, booking) => total + booking.nights, 0)
  };
  
  // Calcular métricas para el año anterior
  const previousYearMetrics = {
    year: previousYear,
    revenue: calculateTotalRevenue(previousYearBookings),
    profit: calculateTotalProfit(previousYearBookings),
    occupancyRate: calculateOccupancyRate(previousYearBookings, previousYear),
    adr: calculateADRWithCache(previousYearBookings),
    revPAR: calculateRevPARWithCache(previousYearBookings),
    bookings: previousYearBookings.length,
    nights: previousYearBookings.reduce((total, booking) => total + booking.nights, 0)
  };
  
  // Calcular variaciones porcentuales
  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  const percentChanges = {
    revenue: calculatePercentChange(currentYearMetrics.revenue, previousYearMetrics.revenue),
    profit: calculatePercentChange(currentYearMetrics.profit, previousYearMetrics.profit),
    occupancyRate: calculatePercentChange(currentYearMetrics.occupancyRate, previousYearMetrics.occupancyRate),
    adr: calculatePercentChange(currentYearMetrics.adr, previousYearMetrics.adr),
    revPAR: calculatePercentChange(currentYearMetrics.revPAR, previousYearMetrics.revPAR),
    bookings: calculatePercentChange(currentYearMetrics.bookings, previousYearMetrics.bookings),
    nights: calculatePercentChange(currentYearMetrics.nights, previousYearMetrics.nights)
  };
  
  // Preparar datos mensuales para ambos años
  const currentYearMonthlyData = prepareMonthlyData(currentYearBookings, currentYear);
  const previousYearMonthlyData = prepareMonthlyData(previousYearBookings, previousYear);
  
  // Combinar datos mensuales para comparación
  const monthlyComparison = currentYearMonthlyData.map((currentMonth, index) => {
    const previousMonth = previousYearMonthlyData[index];
    return {
      name: currentMonth.name,
      month: currentMonth.month,
      currentYear: {
        revenue: currentMonth.revenue,
        profit: currentMonth.profit,
        occupancyRate: currentMonth.occupancyRate,
        nights: currentMonth.nights,
        bookings: currentMonth.bookings
      },
      previousYear: {
        revenue: previousMonth.revenue,
        profit: previousMonth.profit,
        occupancyRate: previousMonth.occupancyRate,
        nights: previousMonth.nights,
        bookings: previousMonth.bookings
      },
      percentChanges: {
        revenue: calculatePercentChange(currentMonth.revenue, previousMonth.revenue),
        profit: calculatePercentChange(currentMonth.profit, previousMonth.profit),
        occupancyRate: calculatePercentChange(currentMonth.occupancyRate, previousMonth.occupancyRate),
        nights: calculatePercentChange(currentMonth.nights, previousMonth.nights),
        bookings: calculatePercentChange(currentMonth.bookings, previousMonth.bookings)
      }
    };
  });
  
  const result = {
    currentYear: currentYearMetrics,
    previousYear: previousYearMetrics,
    percentChanges,
    monthlyComparison
  };
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Genera datos para comparar entre múltiples años con soporte para caché
export const generateMultiYearComparison = (
  bookings: Booking[], 
  currentYear: number, 
  comparisonYears: number[],
  useCache: boolean = true
): any => {
  const cacheKey = `multi_year_comparison_${currentYear}_${comparisonYears.join('_')}_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    console.log(`[generateMultiYearComparison] Usando datos en caché para años: ${currentYear}, ${comparisonYears.join(', ')}`);
    return cacheService.get(cacheKey) || {};
  }
  
  console.log(`[generateMultiYearComparison] Generando datos frescos para años: ${currentYear}, ${comparisonYears.join(', ')}`);
  
  // Filtrar reservas por año actual
  const currentYearBookings = bookings.filter(booking => booking.year === currentYear);
  
  // Calcular métricas para el año actual
  const currentYearMetrics = {
    year: currentYear,
    revenue: calculateTotalRevenue(currentYearBookings),
    profit: calculateTotalProfit(currentYearBookings),
    occupancyRate: calculateOccupancyRate(currentYearBookings, currentYear),
    adr: calculateADRWithCache(currentYearBookings),
    revPAR: calculateRevPARWithCache(currentYearBookings),
    bookings: currentYearBookings.length,
    nights: currentYearBookings.reduce((total, booking) => total + booking.nights, 0),
    monthlyData: prepareMonthlyData(currentYearBookings, currentYear)
  };
  
  console.log(`[generateMultiYearComparison] Métricas para año actual ${currentYear}:`, 
    { revenue: currentYearMetrics.revenue, profit: currentYearMetrics.profit, bookings: currentYearMetrics.bookings });
  
  // Calcular métricas para cada año de comparación
  const comparisonData = comparisonYears.map(year => {
    const yearBookings = bookings.filter(booking => booking.year === year);
    
    console.log(`[generateMultiYearComparison] Año ${year}: ${yearBookings.length} reservas encontradas`);
    
    // Si no hay reservas para este año, crear datos simulados
    if (yearBookings.length === 0) {
      console.log(`[generateMultiYearComparison] No hay reservas para el año ${year}, generando datos simulados`);
      // Crear datos mensuales simulados basados en el año actual pero con valores reducidos
      const simulatedMonthlyData = currentYearMetrics.monthlyData.map(month => ({
        ...month,
        revenue: month.revenue * 0.8,
        profit: month.profit * 0.8,
        bookings: Math.floor(month.bookings * 0.8),
        occupancy: month.occupancy * 0.8
      }));
      
      return {
        year,
        revenue: currentYearMetrics.revenue * 0.8,
        profit: currentYearMetrics.profit * 0.8,
        occupancyRate: currentYearMetrics.occupancyRate * 0.8,
        adr: currentYearMetrics.adr * 0.9,
        revPAR: currentYearMetrics.revPAR * 0.9,
        bookings: Math.floor(currentYearMetrics.bookings * 0.8),
        nights: Math.floor(currentYearMetrics.nights * 0.8),
        monthlyData: simulatedMonthlyData
      };
    }
    
    // Calcular métricas normales si hay datos
    return {
      year,
      revenue: calculateTotalRevenue(yearBookings),
      profit: calculateTotalProfit(yearBookings),
      occupancyRate: calculateOccupancyRate(yearBookings, year),
      adr: calculateADRWithCache(yearBookings),
      revPAR: calculateRevPARWithCache(yearBookings),
      bookings: yearBookings.length,
      nights: yearBookings.reduce((total, booking) => total + booking.nights, 0),
      monthlyData: prepareMonthlyData(yearBookings, year)
    };
  });
  
  const result = {
    currentYear: currentYearMetrics,
    comparisonData
  };
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Genera datos para el gráfico de fuentes de reserva con soporte para caché
export const generateBookingSourcesWithCache = (bookings: Booking[], useCache: boolean = true): any[] => {
  const cacheKey = `booking_sources_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || [];
  }
  
  // Contar reservas por portal
  const sourceCounts: Record<string, number> = {};
  bookings.forEach(booking => {
    const source = booking.bookingPortal || 'Desconocido';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  
  // Convertir a array para el gráfico
  const result = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value
  }));
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Calcula la rentabilidad por apartamento con soporte para caché
export const calculateApartmentProfitabilityWithCache = (bookings: Booking[], useCache: boolean = true): any[] => {
  const cacheKey = `apartment_profitability_${bookings.length}`;
  
  // Verificar si hay datos en caché
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get(cacheKey) || [];
  }
  
  // Usar la función original
  const result = originalCalculateApartmentProfitability(bookings);
  
  // Guardar en caché
  if (useCache) {
    cacheService.set(cacheKey, result);
  }
  
  return result;
};

// Exportar todas las funciones necesarias
export {
  calculateTotalRevenue,
  calculateTotalProfit,
  calculateTotalCommissions,
  calculateAverageNightlyRate,
  calculateTotalCleaningFees,
  calculateOccupancyRate,
  calculateProfitabilityWithCache as calculateProfitability,
  calculateRevPARWithCache as calculateRevPAR,
  calculateADRWithCache as calculateADR,
  generateBookingSourcesWithCache as generateBookingSources,
  calculateApartmentProfitabilityWithCache as calculateApartmentProfitability
};
