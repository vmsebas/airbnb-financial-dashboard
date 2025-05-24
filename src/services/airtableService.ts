import Airtable from 'airtable';
import { Booking } from '../types';
import { AIRTABLE_CONFIG } from '../config/airtable';
import cacheService from './cacheService';

// Inicializar Airtable
const base = new Airtable({ apiKey: AIRTABLE_CONFIG.API_KEY }).base(AIRTABLE_CONFIG.BASE_ID);

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

// Obtener todas las reservas (solo rol admin implícito) con soporte para caché
export const fetchBookings = async (useCache: boolean = true): Promise<Booking[]> => {
  const cacheKey = `bookings_admin`; // Clave de caché siempre para admin
  
  if (useCache && cacheService.has(cacheKey)) {
    console.log(`[fetchBookings] Usando datos de caché para ${cacheKey}`);
    return cacheService.get<Booking[]>(cacheKey) || [];
  }
  
  try {
    console.log(`[fetchBookings] Solicitando todas las reservas de Airtable`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select().all();
    const bookings = records.map(mapAirtableRecordToBooking);
    
    console.log(`[fetchBookings] Devolviendo todas las reservas (${bookings.length})`);
    
    if (useCache) {
      cacheService.set(cacheKey, bookings, 300); // 5 minutos de caché
    }
    
    return bookings;
  } catch (error) {
    console.error('[fetchBookings] Error al obtener las reservas de Airtable:', error);
    if (cacheService.has(cacheKey)) {
      console.warn('[fetchBookings] Usando datos de caché debido a error en Airtable');
      return cacheService.get<Booking[]>(cacheKey) || [];
    }
    return []; // Devolver array vacío en caso de error y sin caché
  }
};

// Obtener reservas por apartamento (solo rol admin implícito) con soporte para caché
export const fetchBookingsByApartment = async (apartmentName: string, useCache: boolean = true): Promise<Booking[]> => {
  const cacheKey = `bookings_apartment_${apartmentName.replace(/\s+/g, '_')}_admin`;
  
  if (useCache && cacheService.has(cacheKey)) {
    console.log(`[fetchBookingsByApartment] Usando datos de caché para ${cacheKey}`);
    return cacheService.get<Booking[]>(cacheKey) || [];
  }
  
  try {
    console.log(`[fetchBookingsByApartment] Solicitando reservas de Airtable para el apartamento: ${apartmentName}`);
    const filterFormula = `{Apartamento} = "${apartmentName.replace(/"/g, '\\"')}"`;
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select({
      filterByFormula: filterFormula
    }).all();
    
    const bookings = records.map(mapAirtableRecordToBooking);
    console.log(`[fetchBookingsByApartment] Devolviendo ${bookings.length} reservas para ${apartmentName}`);

    if (useCache) {
      cacheService.set(cacheKey, bookings, 300);
    }
    
    return bookings;
  } catch (error) {
    console.error(`[fetchBookingsByApartment] Error al obtener las reservas para ${apartmentName}:`, error);
    if (cacheService.has(cacheKey)) {
      console.warn(`[fetchBookingsByApartment] Usando datos de caché para ${apartmentName} debido a error en Airtable`);
      return cacheService.get<Booking[]>(cacheKey) || [];
    }
    return [];
  }
};

// Obtener lista de apartamentos únicos (solo rol admin implícito) con soporte para caché
export const fetchUniqueApartments = async (useCache: boolean = true): Promise<string[]> => {
  const cacheKey = 'unique_apartments_admin';

  if (useCache && cacheService.has(cacheKey)) {
    console.log(`[fetchUniqueApartments] Usando datos de caché para ${cacheKey}`);
    return cacheService.get<string[]>(cacheKey) || [];
  }

  try {
    console.log(`[fetchUniqueApartments] Solicitando todos los apartamentos únicos de Airtable`);
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
    
    const apartmentArray = Array.from(apartments);
    console.log(`[fetchUniqueApartments] Devolviendo todos los apartamentos únicos (${apartmentArray.length})`);

    if (useCache) {
      cacheService.set(cacheKey, apartmentArray, 300);
    }
    
    return apartmentArray;
  } catch (error) {
    console.error('[fetchUniqueApartments] Error al obtener la lista de apartamentos:', error);
    if (cacheService.has(cacheKey)) {
      console.warn('[fetchUniqueApartments] Usando datos de caché debido a error en Airtable');
      return cacheService.get<string[]>(cacheKey) || [];
    }
    return [];
  }
};

// Función para registrar un log detallado de las columnas encontradas
export const analyzeTableColumns = async (): Promise<{ columnNames: string[], sampleValues: Record<string, any> }> => {
  try {
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select({ maxRecords: 1 }).all();
    if (records.length === 0) {
      console.warn('[analyzeTableColumns] No se encontraron registros en Airtable para analizar columnas.');
      return { columnNames: [], sampleValues: {} };
    }
    
    const record = records[0];
    const fields = record._rawJson && record._rawJson.fields ? record._rawJson.fields : {};
    const columnNames = Object.keys(fields);
    
    return {
      columnNames,
      sampleValues: fields
    };
  } catch (error) {
    console.error('[analyzeTableColumns] Error al analizar las columnas de la tabla:', error);
    return { 
      columnNames: [], 
      sampleValues: {} 
    };
  }
};
