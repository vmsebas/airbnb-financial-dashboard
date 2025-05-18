import { Booking } from '../types';

// Listas de datos ficticios para generar reservas
const apartments = [
  'Trindade 1 - Yellow Tiles',
  'Trindade 2 - Blue Tiles',
  'Trindade 4 - White Tiles',
  'I Love Lisboa'
];

const portals = ['Airbnb', 'Booking.com', 'VRBO', 'Directo', 'Expedia'];
const guests = [
  'John Smith', 'María García', 'Pierre Dupont', 'Hans Müller', 
  'Sophie Wilson', 'Carla Martinez', 'David Johnson', 'Emma Brown'
];

const status = ['Confirmada', 'Completada', 'Cancelada'];
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Función para generar un número aleatorio entre min y max (inclusive)
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Función para elegir un elemento aleatorio de un array
const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Función para generar una fecha aleatoria
const randomDate = (year: number, month?: number): string => {
  const selectedMonth = month !== undefined ? month : randomInt(0, 11);
  const day = randomInt(1, 28); // Para simplificar, usamos máximo 28 días
  const date = new Date(year, selectedMonth, day);
  return date.toISOString().split('T')[0];
};

// Función para generar una hora aleatoria
const randomTime = (): string => {
  const hours = randomInt(8, 22).toString().padStart(2, '0');
  const minutes = randomInt(0, 59).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Función para generar datos de reserva ficticios
export const generateMockBooking = (
  id: number, 
  year: number = new Date().getFullYear(),
  specificApartment?: string
): Booking => {
  const selectedMonth = randomInt(0, 11);
  const checkInDate = randomDate(year, selectedMonth);
  const nights = randomInt(1, 14);
  
  // Calcular fecha de salida
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + nights);
  const checkOutDate = checkOut.toISOString().split('T')[0];

  // Generar precios aleatorios
  const pricePerNight = randomInt(50, 200);
  const price = pricePerNight * nights;
  const cleaningFee = randomInt(30, 80);
  const commission = Math.round(price * 0.2);
  const total = price + cleaningFee;
  const profit = price - commission;
  
  // Ocupación, estado y otros datos
  const occupancyRate = randomInt(30, 100);
  const apartmentName = specificApartment || randomChoice(apartments);
  const bookingPortal = randomChoice(portals);
  const currentStatus = randomChoice(status);
  
  // Generar horarios aleatorios
  const checkInTime = randomTime();
  const checkOutTime = randomTime();
  
  // Crear objeto de reserva
  return {
    id: `mock-${id}`,
    createdAt: randomDate(year - 1),
    checkIn: checkInDate,
    checkOut: checkOutDate,
    position: `${id}`,
    apartment: apartmentName,
    guest: randomChoice(guests),
    email: `guest${id}@example.com`,
    phone: `+${randomInt(1, 9)}${randomInt(100000000, 999999999)}`,
    address: `${randomInt(1, 100)} Main Street, City`,
    adults: randomInt(1, 4),
    nights: nights,
    children: randomInt(0, 3),
    status: currentStatus,
    bookingPortal: bookingPortal,
    checkInTime: checkInTime,
    checkOutTime: checkOutTime,
    price: price,
    nightlyAverage: pricePerNight,
    cleaningFee: cleaningFee,
    commission: commission,
    total: total,
    totalWithTax: Math.round(total * 1.21), // IVA 21%
    paid: Math.random() > 0.2, // 80% están pagadas
    notes: 'Reserva generada para modo de demostración',
    year: year,
    month: months[selectedMonth],
    profit: profit,
    // Valores opcionales
    guests: randomInt(1, 6),
    occupancy: occupancyRate,
    // Evitar que sean canceladas las reservas específicas para comparaciones
    ...(specificApartment ? { status: Math.random() > 0.8 ? 'Cancelada' : 'Completada' } : {})
  };
};

// Función para generar múltiples reservas
export const generateMockBookings = (
  count: number = 50, 
  specificApartment?: string, 
  specificYear?: number
): Booking[] => {
  const bookings: Booking[] = [];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
  
  for (let i = 0; i < count; i++) {
    const year = specificYear || randomChoice(years);
    bookings.push(generateMockBooking(i, year, specificApartment));
  }
  
  return bookings;
};

// Función para generar datos comparativos entre años
export const generateYearComparisonData = (
  currentYear: number = new Date().getFullYear(),
  compareYears: number[] = [currentYear - 1]
) => {
  const result = {
    currentYear: {
      year: currentYear,
      revenue: randomInt(50000, 100000),
      profit: randomInt(30000, 70000),
      occupancy: randomInt(60, 95),
      bookings: randomInt(50, 120),
      monthlyData: [] as any[]
    },
    comparisonData: [] as any[],
    monthlyComparisonData: [] as any[]
  };
  
  // Generar datos mensuales para el año actual
  for (let i = 0; i < 12; i++) {
    result.currentYear.monthlyData.push({
      name: months[i],
      revenue: randomInt(3000, 10000),
      profit: randomInt(1500, 7000),
      occupancy: randomInt(40, 100)
    });
  }
  
  // Generar datos para los años de comparación
  compareYears.forEach(year => {
    const yearData = {
      year: year,
      revenue: randomInt(40000, 90000),
      profit: randomInt(25000, 65000),
      occupancy: randomInt(50, 90),
      bookings: randomInt(40, 110),
      monthlyData: [] as any[]
    };
    
    // Generar datos mensuales para este año de comparación
    for (let i = 0; i < 12; i++) {
      yearData.monthlyData.push({
        name: months[i],
        revenue: randomInt(2500, 9000),
        profit: randomInt(1200, 6500),
        occupancy: randomInt(35, 95)
      });
    }
    
    result.comparisonData.push(yearData);
  });
  
  // Generar datos para el gráfico de comparación mensual
  for (let i = 0; i < 12; i++) {
    const monthData: any = {
      name: months[i]
    };
    
    // Agregar datos del año actual
    monthData[currentYear] = result.currentYear.monthlyData[i].revenue;
    
    // Agregar datos de los años de comparación
    compareYears.forEach(year => {
      const yearData = result.comparisonData.find(d => d.year === year);
      if (yearData) {
        monthData[year] = yearData.monthlyData[i].revenue;
      }
    });
    
    result.monthlyComparisonData.push(monthData);
  }
  
  return result;
};
