import Airtable from 'airtable';
import { Booking } from '../types';
import { AIRTABLE_CONFIG } from '../config/airtable';

// Inicializar Airtable
const base = new Airtable({ apiKey: AIRTABLE_CONFIG.API_KEY }).base(AIRTABLE_CONFIG.BASE_ID);

// Lista de apartamentos permitidos para usuarios normales
const USER_ALLOWED_APARTMENTS = ['Trindade 1', 'Trindade 2', 'Trindade 4'];

// Función para comprobar si un apartamento está permitido para usuarios normales
// Exportamos la función para poder usarla en dataService.ts
export const isApartmentAllowedForUser = (apartmentName: string): boolean => {
  return USER_ALLOWED_APARTMENTS.some(allowed => apartmentName.includes(allowed));
};

// Función para mapear los registros de Airtable al formato de nuestra aplicación
const mapAirtableRecordToBooking = (record: any): Booking => {
  // Función auxiliar para manejar valores numéricos
  const parseNumber = (value: any): number | undefined => {
    return value !== undefined && value !== null ? Number(value) : undefined;
  };

  // Función auxiliar para manejar valores booleanos
  const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'sí' || value.toLowerCase() === 'si' || value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true';
    return Boolean(value);
  };

  return {
    id: record.id || '',
    createdAt: record.get('Creado') || '',
    checkIn: record.get('Llegada') || '',
    checkOut: record.get('Salida') || '',
    position: record.get('Posición') || '',
    apartment: record.get('Apartamento') || '',
    guest: record.get('Huésped') || '',
    email: record.get('Email') || '',
    phone: record.get('Teléfono') || '',
    address: record.get('Dirección') || '',
    adults: parseNumber(record.get('Adultos')) || 0,
    nights: parseNumber(record.get('noches')) || 0,
    children: parseNumber(record.get('Niños')) || 0,
    status: record.get('Estado') || '',
    bookingPortal: record.get('Portal de reserva') || '',
    airbnbNights: parseNumber(record.get('AirBnb Nts')),
    bookingNights: parseNumber(record.get('Booking Nts')),
    moreThan7Nights: parseNumber(record.get('Mas 7 Nts')),
    checkInTime: record.get('Check-in') || '',
    checkOutTime: record.get('Check-out') || '',
    price: parseNumber(record.get('Precio')) || 0,
    nightlyAverage: parseNumber(record.get('Media Ntss')) || 0,
    cleaningFee: parseNumber(record.get('Limpieza')) || 0,
    commission: parseNumber(record.get('Comisión 20%')) || 0,
    total: parseNumber(record.get('Total')) || 0,
    totalWithTax: parseNumber(record.get('Total+Iva')) || 0,
    cityTax: parseNumber(record.get('City tax')),
    paid: parseBoolean(record.get('Pagado')),
    notes: record.get('Notas') || '',
    year: parseNumber(record.get('Año')) || new Date().getFullYear(),
    month: record.get('Mes') || '',
    profit: parseNumber(record.get('Beneficio')) || 0,
    
    // Mapeo de columnas adicionales que podrían existir
    guests: parseNumber(record.get('Huéspedes')),
    paymentMethod: record.get('Método de pago') || record.get('Metodo de pago') || undefined,
    invoiceNumber: record.get('Número de factura') || record.get('Numero de factura') || undefined,
    invoiceDate: record.get('Fecha de factura') || undefined,
    vatNumber: record.get('Número de IVA') || record.get('Numero de IVA') || undefined,
    deposit: parseNumber(record.get('Depósito')) || parseNumber(record.get('Deposito')),
    depositPaid: record.get('Depósito pagado') ? parseBoolean(record.get('Depósito pagado')) : 
                 record.get('Deposito pagado') ? parseBoolean(record.get('Deposito pagado')) : undefined,
    balance: parseNumber(record.get('Saldo pendiente')),
    balanceDueDate: record.get('Fecha de vencimiento del saldo') || undefined,
    specialRequests: record.get('Solicitudes especiales') || undefined,
    arrivalTime: record.get('Hora de llegada') || undefined,
    departureTime: record.get('Hora de salida') || undefined,
    nationality: record.get('Nacionalidad') || undefined,
    language: record.get('Idioma') || undefined,
    passportNumber: record.get('Número de pasaporte') || record.get('Numero de pasaporte') || undefined,
    idNumber: record.get('Número de ID') || record.get('Numero de ID') || undefined,
    bookingDate: record.get('Fecha de reserva') || undefined,
    channelManager: record.get('Gestor de canales') || undefined,
    promotion: record.get('Promoción') || record.get('Promocion') || undefined,
    discountAmount: parseNumber(record.get('Importe descuento')),
    discountReason: record.get('Razón descuento') || record.get('Razon descuento') || undefined,
    reviewScore: parseNumber(record.get('Puntuación')) || parseNumber(record.get('Puntuacion')),
    reviewComment: record.get('Comentario') || undefined,
    returnGuest: record.get('Cliente recurrente') ? parseBoolean(record.get('Cliente recurrente')) : undefined,
    assignedStaff: record.get('Personal asignado') || undefined,
    maintenanceNeeded: record.get('Mantenimiento necesario') || undefined,
  };
};

// Obtener todas las reservas según el rol del usuario
export const fetchBookings = async (role: string | null = 'admin'): Promise<Booking[]> => {
  try {
    console.log(`fetchBookings - Solicitando reservas con rol: ${role}`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select().all();
    const bookings = records.map(mapAirtableRecordToBooking);
    
    // Si el usuario es admin, devolvemos todas las reservas
    if (role === 'admin') {
      console.log(`fetchBookings - Rol admin: Devolviendo todas las reservas (${bookings.length})`);
      return bookings;
    }
    
    // Si el usuario es normal, filtramos las reservas
    const filteredBookings = bookings.filter(booking => isApartmentAllowedForUser(booking.apartment));
    console.log(`fetchBookings - Rol user: Filtrando reservas ${filteredBookings.length} de ${bookings.length}`);
    console.log('Apartamentos permitidos:', USER_ALLOWED_APARTMENTS);
    console.log('Primeros 5 apartamentos filtrados:', filteredBookings.slice(0, 5).map(b => b.apartment));
    return filteredBookings;
  } catch (error) {
    console.error('Error al obtener las reservas de Airtable:', error);
    return [];
  }
};

// Obtener reservas por apartamento según el rol
export const fetchBookingsByApartment = async (apartmentName: string, role: string | null = 'admin'): Promise<Booking[]> => {
  try {
    // Para usuarios normales, verificar si tienen acceso a este apartamento
    if (role === 'user' && !isApartmentAllowedForUser(apartmentName)) {
      console.log(`fetchBookingsByApartment - Usuario no autorizado para acceder a: ${apartmentName}`);
      return [];
    }
    
    console.log(`fetchBookingsByApartment - Solicitando reservas para ${apartmentName} con rol ${role}`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE)
      .select({
        filterByFormula: `{Apartamento} = '${apartmentName}'`
      })
      .all();
    const mappedBookings = records.map(mapAirtableRecordToBooking);
    console.log(`fetchBookingsByApartment - Encontradas ${mappedBookings.length} reservas para ${apartmentName}`);
    return mappedBookings;
  } catch (error) {
    console.error(`Error al obtener las reservas para el apartamento ${apartmentName}:`, error);
    return [];
  }
};

// Obtener lista de apartamentos únicos según el rol del usuario
export const fetchUniqueApartments = async (role: string | null = 'admin'): Promise<string[]> => {
  try {
    console.log(`fetchUniqueApartments - Solicitando apartamentos con rol: ${role}`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select({
      fields: ['Apartamento']
    }).all();
    
    const apartments = new Set<string>();
    records.forEach(record => {
      const apartment = record.get('Apartamento');
      if (apartment && typeof apartment === 'string' && apartment.trim() !== '') {
        apartments.add(apartment as string);
      }
    });
    
    let apartmentArray = Array.from(apartments);
    
    // Filtrar los apartamentos según el rol
    if (role === 'user') {
      const filteredApartments = apartmentArray.filter(apt => isApartmentAllowedForUser(apt));
      console.log(`fetchUniqueApartments - Rol user: Filtrando apartamentos ${filteredApartments.length} de ${apartmentArray.length}`);
      console.log('Apartamentos permitidos:', USER_ALLOWED_APARTMENTS);
      console.log('Apartamentos filtrados:', filteredApartments);
      return filteredApartments;
    }
    
    console.log(`fetchUniqueApartments - Rol admin: Devolviendo todos los apartamentos (${apartmentArray.length})`);
    return apartmentArray;
  } catch (error) {
    console.error('Error al obtener la lista de apartamentos:', error);
    return [];
  }
};

// Función para registrar un log detallado de las columnas encontradas
export const analyzeTableColumns = async (): Promise<{ columnNames: string[], sampleValues: Record<string, any> }> => {
  try {
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select({ maxRecords: 1 }).all();
    if (records.length === 0) {
      return { columnNames: [], sampleValues: {} };
    }
    
    const record = records[0];
    const fields = record._rawJson.fields;
    const columnNames = Object.keys(fields);
    
    return {
      columnNames,
      sampleValues: fields
    };
  } catch (error) {
    console.error('Error al analizar las columnas de la tabla:', error);
    return { columnNames: [], sampleValues: {} };
  }
};
