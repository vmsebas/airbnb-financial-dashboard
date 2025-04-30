import { Booking, ApartmentSummary, BookingSource, MonthlyData, YearlyData } from '../types';
import { fetchBookings, isApartmentAllowedForUser } from './airtableService';

// Sample data based on the provided CSV data
export const apartments = [
  'Trindade 1 - Yellow Tiles',
  'Trindade 4 - White Tiles',
  'I Love Lisboa'
];

// Convert the CSV data to our booking format
export const bookings: Booking[] = [
  {
    id: '28445618',
    createdAt: '2022-09-15',
    checkIn: '2016-12-27',
    checkOut: '2016-12-28',
    position: '28445618',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Claudia Suárez',
    adults: 0,
    nights: 1,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Airbnb',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 0,
    nightlyAverage: 0,
    cleaningFee: 60,
    commission: -10.80,
    total: 49.20,
    totalWithTax: 60.52,
    paid: false,
    year: 2016,
    month: 'Diciembre',
    profit: -60.52
  },
  {
    id: '28445093',
    createdAt: '2022-09-15',
    checkIn: '2017-01-16',
    checkOut: '2017-01-19',
    position: '28445093',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Mazagao Riad',
    adults: 0,
    nights: 3,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Airbnb',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 0,
    nightlyAverage: 0,
    cleaningFee: 60,
    commission: -10.80,
    total: 49.20,
    totalWithTax: 60.52,
    paid: false,
    year: 2017,
    month: 'Enero',
    profit: -60.52
  },
  {
    id: '28447112',
    createdAt: '2022-09-15',
    checkIn: '2017-05-11',
    checkOut: '2017-09-11',
    position: '28447112',
    apartment: 'I Love Lisboa',
    guest: 'Johann User',
    adults: 0,
    nights: 123,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Airbnb',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 0,
    nightlyAverage: 0,
    cleaningFee: 35,
    commission: -6.30,
    total: 28.70,
    totalWithTax: 35.30,
    paid: false,
    year: 2017,
    month: 'Mayo',
    profit: -35.30
  },
  {
    id: '28444817',
    createdAt: '2022-09-15',
    checkIn: '2018-04-25',
    checkOut: '2018-04-29',
    position: '28444817',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Tom Faber',
    adults: 0,
    nights: 4,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Airbnb',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 796.00,
    nightlyAverage: 199.00,
    cleaningFee: 60,
    commission: 132.48,
    total: 192.48,
    totalWithTax: 236.75,
    paid: false,
    year: 2018,
    month: 'Abril',
    profit: 559.25
  },
  {
    id: '28445522',
    createdAt: '2022-09-15',
    checkIn: '2018-04-29',
    checkOut: '2018-04-30',
    position: '28445522',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Elena Mongia',
    adults: 0,
    nights: 1,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Booking.com',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 370.00,
    nightlyAverage: 370.00,
    cleaningFee: 60,
    commission: 55.80,
    total: 115.80,
    totalWithTax: 142.43,
    paid: false,
    year: 2018,
    month: 'Abril',
    profit: 227.57
  },
  {
    id: '28445000',
    createdAt: '2022-09-15',
    checkIn: '2018-04-30',
    checkOut: '2018-05-06',
    position: '28445000',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Pierre Dumon',
    adults: 0,
    nights: 6,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Booking.com',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 1614.60,
    nightlyAverage: 269.10,
    cleaningFee: 60,
    commission: 279.83,
    total: 339.83,
    totalWithTax: 417.99,
    paid: false,
    year: 2018,
    month: 'Abril',
    profit: 1196.61
  },
  {
    id: '28445390',
    createdAt: '2022-09-15',
    checkIn: '2018-05-06',
    checkOut: '2018-05-09',
    position: '28445390',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Isabel Cruz',
    adults: 0,
    nights: 3,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Airbnb',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 687.00,
    nightlyAverage: 229.00,
    cleaningFee: 60,
    commission: 112.86,
    total: 172.86,
    totalWithTax: 212.62,
    paid: false,
    year: 2018,
    month: 'Mayo',
    profit: 474.38
  },
  {
    id: '28445645',
    createdAt: '2022-09-15',
    checkIn: '2018-05-09',
    checkOut: '2018-05-11',
    position: '28445645',
    apartment: 'Trindade 4 - White Tiles',
    guest: 'Chia Hua',
    adults: 0,
    nights: 2,
    children: 0,
    status: 'Reservado',
    bookingPortal: 'Airbnb',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    price: 598.00,
    nightlyAverage: 299.00,
    cleaningFee: 60,
    commission: 96.84,
    total: 156.84,
    totalWithTax: 192.91,
    paid: false,
    year: 2018,
    month: 'Mayo',
    profit: 405.09
  }
];

// Función centralizada para obtener reservas según el rol del usuario
export const getBookings = async (role: 'admin' | 'user'): Promise<Booking[]> => {
  try {
    // Utilizamos fetchBookings de airtableService que ya implementa el filtrado por rol
    // No necesitamos duplicar la lógica de filtrado aquí
    const bookingsData = await fetchBookings(role);
    
    // Añadimos logs detallados para facilitar la depuración
    console.log(`[dataService.getBookings] Recibidas ${bookingsData.length} reservas para rol ${role}`);
    
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

// Generate apartment summaries
export const getApartmentSummary = (apartmentName: string): ApartmentSummary => {
  const apartmentBookings = bookings.filter(booking => booking.apartment === apartmentName);
  
  const totalRevenue = apartmentBookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalNights = apartmentBookings.reduce((sum, booking) => sum + booking.nights, 0);
  const avgNightlyRate = totalNights > 0 ? apartmentBookings.reduce((sum, booking) => 
    sum + (booking.nightlyAverage * booking.nights), 0) / totalNights : 0;
  
  // Simple occupancy calculation (would be better with actual calendar logic)
  const occupancyRate = totalNights > 0 ? Math.min((totalNights / (365 * apartments.length)) * 100, 100) : 0;
  
  return {
    name: apartmentName,
    bookings: apartmentBookings.length,
    totalRevenue,
    averageNightlyRate: avgNightlyRate,
    occupancyRate,
    totalNights,
    averageStay: apartmentBookings.length > 0 ? totalNights / apartmentBookings.length : 0
  };
};

// Get summaries for all apartments
export const getAllApartmentSummaries = (): ApartmentSummary[] => {
  return apartments.map(apartment => getApartmentSummary(apartment));
};

// Get booking sources
export const getBookingSources = (): BookingSource[] => {
  const sources: { [key: string]: { bookings: number; revenue: number } } = {};
  
  bookings.forEach(booking => {
    if (!sources[booking.bookingPortal]) {
      sources[booking.bookingPortal] = { bookings: 0, revenue: 0 };
    }
    sources[booking.bookingPortal].bookings += 1;
    sources[booking.bookingPortal].revenue += booking.price;
  });
  
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);
  
  return Object.keys(sources).map(source => ({
    name: source,
    bookings: sources[source].bookings,
    revenue: sources[source].revenue,
    percentage: (sources[source].bookings / totalBookings) * 100
  }));
};

// Get monthly data for a specific year
export const getMonthlyData = (year: number): MonthlyData[] => {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const yearBookings = bookings.filter(booking => booking.year === year);
  
  return monthNames.map(monthName => {
    const monthBookings = yearBookings.filter(booking => booking.month === monthName);
    const revenue = monthBookings.reduce((sum, booking) => sum + booking.price, 0);
    const nights = monthBookings.reduce((sum, booking) => sum + booking.nights, 0);
    // Approximate occupancy
    const daysInMonth = 30; // Simplified
    const occupancyRate = (nights / (daysInMonth * apartments.length)) * 100;
    
    return {
      month: monthName,
      revenue: revenue,
      bookings: monthBookings.length,
      occupancyRate: Math.min(occupancyRate, 100),
      averageRate: monthBookings.length > 0 ? revenue / monthBookings.length : 0
    };
  });
};

// Get yearly data
export const getYearlyData = (): YearlyData[] => {
  // Get unique years from bookings
  const years = [...new Set(bookings.map(booking => booking.year))];
  
  return years.map(year => {
    const monthlyData = getMonthlyData(year);
    const yearBookings = bookings.filter(booking => booking.year === year);
    
    return {
      year,
      months: monthlyData,
      totalRevenue: yearBookings.reduce((sum, booking) => sum + booking.price, 0),
      totalBookings: yearBookings.length,
      averageOccupancy: monthlyData.reduce((sum, month) => sum + month.occupancyRate, 0) / 12
    };
  });
};

// Get apartment-specific bookings
export const getApartmentBookings = (apartmentName: string): Booking[] => {
  return bookings.filter(booking => booking.apartment === apartmentName);
};

// Calculate total revenue across all bookings
export const getTotalRevenue = (): number => {
  return bookings.reduce((sum, booking) => sum + booking.price, 0);
};

// Calculate total profit across all bookings
export const getTotalProfit = (): number => {
  return bookings.reduce((sum, booking) => sum + booking.profit, 0);
};

// Calculate average nightly rate across all bookings
export const getAverageNightlyRate = (): number => {
  const totalNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);
  return totalNights > 0 ? 
    bookings.reduce((sum, booking) => sum + (booking.nightlyAverage * booking.nights), 0) / totalNights : 
    0;
};

// Calculate total cleaning fees
export const getTotalCleaningFees = (): number => {
  return bookings.reduce((sum, booking) => sum + booking.cleaningFee, 0);
};

// Calculate total commissions
export const getTotalCommissions = (): number => {
  return bookings.reduce((sum, booking) => sum + booking.commission, 0);
};
