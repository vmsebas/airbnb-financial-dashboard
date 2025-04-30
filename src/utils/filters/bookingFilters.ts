import { Booking } from '@/types';
import { FilterState } from '@/context/FilterContext';

/**
 * Filter bookings based on the filter criteria
 */
export const filterBookings = (bookings: Booking[], filters: FilterState): Booking[] => {
  console.log('[filterBookings] Iniciando filtrado con criterios:', filters);
  console.log(`[filterBookings] Total de reservas antes del filtrado: ${bookings.length}`);
  
  // Verificar que bookings es un array válido
  if (!Array.isArray(bookings)) {
    console.error('[filterBookings] Error: bookings no es un array válido', bookings);
    return [];
  }
  
  // Verificar que filters es un objeto válido
  if (!filters || typeof filters !== 'object') {
    console.error('[filterBookings] Error: filters no es un objeto válido', filters);
    return bookings; // Devolver sin filtrar si los filtros no son válidos
  }
  
  const filteredBookings = bookings.filter(booking => {
    // Verificar que booking es un objeto válido
    if (!booking || typeof booking !== 'object') {
      console.error('[filterBookings] Error: booking no es un objeto válido', booking);
      return false;
    }
    
    // Filtrado por año
    if (filters.year && booking.year !== undefined && booking.year !== null) {
      if (booking.year !== filters.year) {
        // console.log(`Filtro año: excluye booking ${booking.id}, año ${booking.year} != ${filters.year}`);
        return false;
      }
    }
    
    // Filtrado por mes
    if (filters.month && filters.month !== 'all' && booking.month !== undefined) {
      if (booking.month !== filters.month) {
        // console.log(`Filtro mes: excluye booking ${booking.id}, mes ${booking.month} != ${filters.month}`);
        return false;
      }
    }
    
    // Filtrado por apartamento (solo si se proporciona un filtro de apartamento)
    if (filters.apartment && filters.apartment !== 'all' && booking.apartment !== undefined) {
      if (booking.apartment !== filters.apartment) {
        // console.log(`Filtro apartamento: excluye booking ${booking.id}, apartamento ${booking.apartment} != ${filters.apartment}`);
        return false;
      }
    }
    
    // Filtrado por fuente de reserva
    if (filters.bookingSource && filters.bookingSource !== 'all' && booking.bookingPortal !== undefined) {
      if (booking.bookingPortal !== filters.bookingSource) {
        // console.log(`Filtro fuente: excluye booking ${booking.id}, portal ${booking.bookingPortal} != ${filters.bookingSource}`);
        return false;
      }
    }
    
    // Filtrado por estado de pago
    if (filters.paymentStatus !== null && filters.paymentStatus !== 'all' && booking.paid !== undefined) {
      // Convertir string a boolean si es necesario
      const paymentStatus = typeof filters.paymentStatus === 'string' ? 
        filters.paymentStatus === 'true' : filters.paymentStatus;
      
      if (booking.paid !== paymentStatus) {
        // console.log(`Filtro pago: excluye booking ${booking.id}, pagado ${booking.paid} != ${paymentStatus}`);
        return false;
      }
    }
    
    // Filtrado por rango de fechas
    if ((filters.dateRange.from || filters.dateRange.to) && booking.checkIn && booking.checkOut) {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      // Verificar que las fechas son válidas
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        console.error(`[filterBookings] Error: fechas inválidas para la reserva ${booking.id}`, 
          { checkIn: booking.checkIn, checkOut: booking.checkOut });
        return false;
      }
      
      // Comprobar si la estancia se solapa con el rango de fechas seleccionado
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from);
        if (isNaN(fromDate.getTime())) {
          console.error('[filterBookings] Error: fecha de inicio de filtro inválida', filters.dateRange.from);
        } else if (checkOut < fromDate) {
          // La estancia termina antes del inicio del rango
          return false;
        }
      }
      
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        if (isNaN(toDate.getTime())) {
          console.error('[filterBookings] Error: fecha de fin de filtro inválida', filters.dateRange.to);
        } else if (checkIn > toDate) {
          // La estancia comienza después del fin del rango
          return false;
        }
      }
    }
    
    return true;
  });
  
  console.log(`[filterBookings] Reservas después del filtrado: ${filteredBookings.length} (eliminadas: ${bookings.length - filteredBookings.length})`);
  if (filteredBookings.length > 0 && filteredBookings.length <= 5) {
    console.log('[filterBookings] Reservas filtradas:', 
      filteredBookings.map(b => ({ id: b.id, apartment: b.apartment, checkIn: b.checkIn, checkOut: b.checkOut })));
  }
  
  return filteredBookings;
};

/**
 * Get available years from bookings
 */
export const getAvailableYears = (bookings: Booking[]): number[] => {
  const yearsSet = new Set<number>();
  bookings.forEach(booking => {
    if (booking.year) {
      yearsSet.add(booking.year);
    }
  });
  return Array.from(yearsSet).sort();
};

/**
 * Get available months for a specific year
 */
export const getAvailableMonths = (bookings: Booking[], year: number): string[] => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthsSet = new Set<string>();
  bookings
    .filter(booking => booking.year === year)
    .forEach(booking => {
      if (booking.month) {
        monthsSet.add(booking.month);
      }
    });
  
  // Ordenar los meses según su posición en el array monthNames
  return Array.from(monthsSet).sort((a, b) => {
    return monthNames.indexOf(a) - monthNames.indexOf(b);
  });
};

/**
 * Calculate accurate occupancy rate considering days in period
 */
export const calculateOccupancyRate = (bookings: Booking[], year: number, month: string | null = null): number => {
  // Filtrar por año
  let filteredBookings = bookings.filter(booking => booking.year === year);
  
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
