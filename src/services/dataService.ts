import { Booking, ApartmentSummary, BookingSource, MonthlyData, YearlyData } from '../types';
import { fetchBookings, fetchUniqueApartments } from './airtableService';

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsData = await fetchBookings();
    console.log(`[dataService.getBookings] Recibidas ${bookingsData.length} reservas.`);
    if (bookingsData.length > 0) {
      console.log(`[dataService.getBookings] Primeros apartamentos: ${
        bookingsData.slice(0, 3).map(b => b.apartment).join(', ')
      }...`);
    }
    return bookingsData;
  } catch (error) {
    console.error('[dataService.getBookings] Error al obtener reservas:', error);
    return [];
  }
};

export const getApartmentSummary = async (apartmentName: string): Promise<ApartmentSummary | null> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    console.warn(`[getApartmentSummary] No se encontraron reservas para generar el resumen de ${apartmentName}`);
    return {
      name: apartmentName,
      bookings: 0,
      totalRevenue: 0,
      averageNightlyRate: 0,
      occupancyRate: 0,
      totalNights: 0,
      averageStay: 0,
    };
  }
  const apartmentBookings = allBookings.filter(booking => booking.apartment === apartmentName);

  if (apartmentBookings.length === 0) {
    return {
      name: apartmentName,
      bookings: 0,
      totalRevenue: 0,
      averageNightlyRate: 0,
      occupancyRate: 0,
      totalNights: 0,
      averageStay: 0,
    };
  }

  const totalRevenue = apartmentBookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalNights = apartmentBookings.reduce((sum, booking) => sum + booking.nights, 0);
  const avgNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
  
  const occupiedDays = new Set(
    apartmentBookings.flatMap(b => {
      const dates = [];
      let currentDate = new Date(b.checkIn);
      const endDate = new Date(b.checkOut);
      while (currentDate < endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    })
  ).size;
  const daysInReferencePeriod = 365; 
  const occupancyRate = totalNights > 0 ? (occupiedDays / daysInReferencePeriod) * 100 : 0;

  return {
    name: apartmentName,
    bookings: apartmentBookings.length,
    totalRevenue,
    averageNightlyRate: avgNightlyRate,
    occupancyRate: Math.min(occupancyRate, 100),
    totalNights,
    averageStay: apartmentBookings.length > 0 ? totalNights / apartmentBookings.length : 0
  };
};

export const getAllApartmentSummaries = async (): Promise<ApartmentSummary[]> => {
  const uniqueApartmentNames = await fetchUniqueApartments();
  if (!uniqueApartmentNames || uniqueApartmentNames.length === 0) {
    return [];
  }
  const summaries = await Promise.all(
    uniqueApartmentNames.map(async (apartment) => {
      return getApartmentSummary(apartment); 
    })
  );
  return summaries.filter(s => s !== null) as ApartmentSummary[];
};

export const getBookingSources = async (): Promise<BookingSource[]> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return [];
  }
  const sources: { [key: string]: { bookings: number; revenue: number } } = {};
  
  allBookings.forEach(booking => {
    if (!sources[booking.bookingPortal]) {
      sources[booking.bookingPortal] = { bookings: 0, revenue: 0 };
    }
    sources[booking.bookingPortal].bookings += 1;
    sources[booking.bookingPortal].revenue += booking.price;
  });
  
  const totalBookings = allBookings.length;
  
  return Object.keys(sources).map(source => ({
    name: source,
    bookings: sources[source].bookings,
    revenue: sources[source].revenue,
    percentage: totalBookings > 0 ? (sources[source].bookings / totalBookings) * 100 : 0
  }));
};

export const getMonthlyData = async (year: number): Promise<MonthlyData[]> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return [];
  }
  const uniqueApartmentNames = await fetchUniqueApartments();
  const numberOfApartments = uniqueApartmentNames ? uniqueApartmentNames.length : 0;

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const yearBookings = allBookings.filter(booking => booking.year === year);
  
  return monthNames.map(monthName => {
    const monthBookings = yearBookings.filter(booking => booking.month === monthName);
    const revenue = monthBookings.reduce((sum, booking) => sum + booking.price, 0);
    const nights = monthBookings.reduce((sum, booking) => sum + booking.nights, 0);
    
    const daysInMonth = new Date(year, monthNames.indexOf(monthName) + 1, 0).getDate();
    const occupancyRate = (numberOfApartments > 0 && daysInMonth > 0) ? (nights / (daysInMonth * numberOfApartments)) * 100 : 0;
    
    return {
      month: monthName,
      revenue: revenue,
      bookings: monthBookings.length,
      occupancyRate: Math.min(occupancyRate, 100),
      averageRate: nights > 0 ? revenue / nights : 0 
    };
  });
};

export const getYearlyData = async (): Promise<YearlyData[]> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return [];
  }
  const years = [...new Set(allBookings.map(booking => booking.year))].sort((a,b) => a-b);
  
  const yearlyDataPromises = years.map(async (year) => {
    const monthlyData = await getMonthlyData(year); 
    const yearBookings = allBookings.filter(booking => booking.year === year);
    
    return {
      year,
      months: monthlyData,
      totalRevenue: yearBookings.reduce((sum, booking) => sum + booking.price, 0),
      totalBookings: yearBookings.length,
      averageOccupancy: monthlyData.length > 0 ? monthlyData.reduce((sum, month) => sum + month.occupancyRate, 0) / monthlyData.length : 0
    };
  });
  return Promise.all(yearlyDataPromises);
};

export const getApartmentBookings = async (apartmentName: string): Promise<Booking[]> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return [];
  }
  return allBookings.filter(booking => booking.apartment === apartmentName);
};

export const getTotalRevenue = async (): Promise<number> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return 0;
  }
  return allBookings.reduce((sum, booking) => sum + booking.price, 0);
};

export const getTotalProfit = async (): Promise<number> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return 0;
  }
  return allBookings.reduce((sum, booking) => sum + booking.profit, 0);
};

export const getAverageNightlyRate = async (): Promise<number> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return 0;
  }
  const totalNights = allBookings.reduce((sum, booking) => sum + booking.nights, 0);
  const totalNightlyRevenue = allBookings.reduce((sum, booking) => sum + (booking.nightlyAverage * booking.nights), 0);
  return totalNights > 0 ? totalNightlyRevenue / totalNights : 0;
};

export const getTotalCleaningFees = async (): Promise<number> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return 0;
  }
  return allBookings.reduce((sum, booking) => sum + booking.cleaningFee, 0);
};

export const getTotalCommissions = async (): Promise<number> => {
  const allBookings = await getBookings();
  if (!allBookings || allBookings.length === 0) {
    return 0;
  }
  return allBookings.reduce((sum, booking) => sum + booking.commission, 0);
};
