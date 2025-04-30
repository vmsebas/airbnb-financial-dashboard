import { Booking } from '@/types';

/**
 * Filtra las reservas para obtener solo las activas (no canceladas)
 * Esta función es clave para excluir las cancelaciones de los cálculos financieros
 */
export const filterActiveBookings = (bookings: Booking[]): Booking[] => {
  if (!Array.isArray(bookings)) {
    console.error('[filterActiveBookings] Error: bookings no es un array válido', bookings);
    return [];
  }

  const filtered = bookings.filter(booking => booking.status !== 'Cancelado');
  console.log(`[filterActiveBookings] Reservas filtradas: ${filtered.length} de ${bookings.length} (eliminadas ${bookings.length - filtered.length} cancelaciones)`);
  return filtered;
};

/**
 * Calculate total revenue from bookings
 */
export const calculateTotalRevenue = (bookings: Booking[]): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  return activeBookings.reduce((sum, booking) => sum + booking.price, 0);
};

/**
 * Calculate total profit from bookings
 */
export const calculateTotalProfit = (bookings: Booking[]): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  return activeBookings.reduce((sum, booking) => sum + booking.profit, 0);
};

/**
 * Calculate total commissions from bookings
 */
export const calculateTotalCommissions = (bookings: Booking[]): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  return activeBookings.reduce((sum, booking) => sum + booking.commission, 0);
};

/**
 * Calculate total cleaning fees from bookings
 */
export const calculateTotalCleaningFees = (bookings: Booking[]): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  return activeBookings.reduce((sum, booking) => sum + booking.cleaningFee, 0);
};

/**
 * Calculate average nightly rate
 */
export const calculateAverageNightlyRate = (bookings: Booking[]): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  const totalNights = activeBookings.reduce((sum, booking) => sum + booking.nights, 0);
  return totalNights > 0 
    ? activeBookings.reduce((sum, booking) => sum + (booking.nightlyAverage * booking.nights), 0) / totalNights 
    : 0;
};

/**
 * Calculate occupancy rate
 */
export const calculateOccupancyRate = (bookings: Booking[], year: number, month: string | null = null): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  
  let filteredBookings = activeBookings;
  
  // Filtrar por año
  filteredBookings = filteredBookings.filter(booking => booking.year === year);
  
  // Si se proporciona un mes, filtrar por mes
  if (month) {
    filteredBookings = filteredBookings.filter(booking => booking.month === month);
  }
  
  const totalNights = filteredBookings.reduce((sum, booking) => sum + booking.nights, 0);
  
  // Calcular días en el período
  let daysInPeriod: number;
  if (month) {
    // Obtener el índice del mes (0-11)
    const monthIndex = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ].indexOf(month);
    
    if (monthIndex === -1) {
      return 0; // Mes no válido
    }
    
    daysInPeriod = new Date(year, monthIndex + 1, 0).getDate();
  } else {
    // Verificar si es año bisiesto
    daysInPeriod = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
  }
  
  // Obtener número de apartamentos únicos
  const apartmentsSet = new Set<string>();
  filteredBookings.forEach(booking => apartmentsSet.add(booking.apartment));
  const numApartments = Math.max(1, apartmentsSet.size);
  
  // Calcular tasa de ocupación (noches reservadas / noches disponibles)
  return Math.min((totalNights / (daysInPeriod * numApartments)) * 100, 100);
};

/**
 * Calculate profitability (profit / revenue)
 */
export const calculateProfitability = (bookings: Booking[]): number => {
  // Filtrar para excluir cancelaciones
  const activeBookings = filterActiveBookings(bookings);
  const totalRevenue = calculateTotalRevenue(activeBookings);
  const totalProfit = calculateTotalProfit(activeBookings);
  
  return totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
};
