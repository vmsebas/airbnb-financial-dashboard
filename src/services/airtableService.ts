import Airtable from 'airtable';
import { Booking } from '../types';
import { AIRTABLE_CONFIG } from '../config/airtable';
import { generateMockBookings } from '../utils/mockData';
import cacheService from './cacheService';

// Inicializar Airtable
const base = new Airtable({ apiKey: AIRTABLE_CONFIG.API_KEY }).base(AIRTABLE_CONFIG.BASE_ID);

// Lista de apartamentos permitidos para usuarios normales
const USER_ALLOWED_APARTMENTS = ['Trindade 1', 'Trindade 2', 'Trindade 4'];

// Flag para determinar si debemos usar datos de muestra
let usesMockData = false;

// Función para comprobar si un apartamento está permitido para usuarios normales
// Exportamos la función para poder usarla en dataService.ts
export const isApartmentAllowedForUser = (apartmentName: string): boolean => {
  // Usar una comparación exacta en lugar de includes() para evitar falsos positivos
  // Ejemplo: "No Trindade 1" sería detectado incorrectamente con includes()
  return USER_ALLOWED_APARTMENTS.some(allowed => 
    apartmentName === allowed || 
    // También permitimos si el nombre del apartamento comienza con el nombre permitido seguido de un guion o espacio
    apartmentName.startsWith(allowed + ' ') || 
    apartmentName.startsWith(allowed + '-')
  );
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

// Obtener todas las reservas según el rol del usuario con soporte para caché
export const fetchBookings = async (role: string | null = 'admin', useCache: boolean = true): Promise<Booking[]> => {
  const cacheKey = `bookings_${role}`;
  
  // Verificar si hay datos en caché y si debemos usarlos
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get<Booking[]>(cacheKey) || [];
  }
  
  try {
    // Si ya estamos usando datos de muestra, continuar con ellos
    if (usesMockData) {
      console.log(`[fetchBookings] Usando datos de muestra para rol: ${role}`);
      const mockBookings = generateMockBookings(100); // Generar 100 reservas de muestra
      
      const result = role === 'admin' 
        ? mockBookings 
        : mockBookings.filter(booking => isApartmentAllowedForUser(booking.apartment));
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(cacheKey, result, 300); // 5 minutos de caché
      }
      
      return result;
    }
    
    console.log(`[fetchBookings] Solicitando reservas de Airtable con rol: ${role}`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select().all();
    const bookings = records.map(mapAirtableRecordToBooking);
    
    let result: Booking[];
    
    // Si el usuario es admin, devolvemos todas las reservas
    if (role === 'admin') {
      console.log(`[fetchBookings] Rol admin: Devolviendo todas las reservas (${bookings.length})`);
      result = bookings;
    } else {
      // Si el usuario es normal, filtramos las reservas
      const filteredBookings = bookings.filter(booking => isApartmentAllowedForUser(booking.apartment));
      console.log(`[fetchBookings] Rol user: Filtrando reservas ${filteredBookings.length} de ${bookings.length}`);
      console.log('[fetchBookings] Apartamentos permitidos:', USER_ALLOWED_APARTMENTS);
      console.log('[fetchBookings] Primeros 5 apartamentos filtrados:', filteredBookings.slice(0, 5).map(b => b.apartment));
      result = filteredBookings;
    }
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, result, 300); // 5 minutos de caché
    }
    
    return result;
  } catch (error) {
    console.error('[fetchBookings] Error al obtener las reservas de Airtable:', error);
    
    // Verificar si hay datos en caché a pesar del error
    if (cacheService.has(cacheKey)) {
      console.log('[fetchBookings] Usando datos de caché debido al error');
      return cacheService.get<Booking[]>(cacheKey) || [];
    }
    
    // Marcar que estamos usando datos de muestra
    usesMockData = true;
    console.log('[fetchBookings] Cambiando a datos de muestra');
    
    // Generar datos de muestra
    const mockBookings = generateMockBookings(100); // Generar 100 reservas de muestra
    
    // Filtrar según el rol
    const result = role === 'admin' 
      ? mockBookings 
      : mockBookings.filter(booking => isApartmentAllowedForUser(booking.apartment));
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, result);
    }
    
    return result;
  }
};

// Obtener reservas por apartamento según el rol con soporte para caché
export const fetchBookingsByApartment = async (apartmentName: string, role: string | null = 'admin', useCache: boolean = true): Promise<Booking[]> => {
  const cacheKey = `bookings_apartment_${apartmentName}_${role}`;
  
  // Verificar si hay datos en caché y si debemos usarlos
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get<Booking[]>(cacheKey) || [];
  }
  
  try {
    // Si ya estamos usando datos de muestra, continuar con ellos
    if (usesMockData) {
      console.log(`[fetchBookingsByApartment] Usando datos de muestra para ${apartmentName} con rol: ${role}`);
      const mockBookings = generateMockBookings(30, apartmentName); // Generar 30 reservas de muestra para este apartamento
      
      const result = (role === 'admin' || isApartmentAllowedForUser(apartmentName))
        ? mockBookings
        : [];
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(cacheKey, result);
      }
      
      return result;
    }
    
    // Para usuarios normales, verificar si tienen acceso a este apartamento
    if (role === 'user' && !isApartmentAllowedForUser(apartmentName)) {
      console.log(`[fetchBookingsByApartment] Usuario no autorizado para acceder a: ${apartmentName}`);
      return [];
    }
    
    console.log(`[fetchBookingsByApartment] Solicitando reservas para ${apartmentName} con rol ${role}`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE)
      .select({
        filterByFormula: `{Apartamento} = '${apartmentName}'`
      })
      .all();
    const mappedBookings = records.map(mapAirtableRecordToBooking);
    console.log(`[fetchBookingsByApartment] Encontradas ${mappedBookings.length} reservas para ${apartmentName}`);
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, mappedBookings);
    }
    
    return mappedBookings;
  } catch (error) {
    console.error(`[fetchBookingsByApartment] Error al obtener las reservas para el apartamento ${apartmentName}:`, error);
    
    // Verificar si hay datos en caché a pesar del error
    if (cacheService.has(cacheKey)) {
      console.log('[fetchBookingsByApartment] Usando datos de caché debido al error');
      return cacheService.get<Booking[]>(cacheKey) || [];
    }
    
    // Marcar que estamos usando datos de muestra
    usesMockData = true;
    console.log('[fetchBookingsByApartment] Cambiando a datos de muestra');
    
    // Generar datos de muestra
    const mockBookings = generateMockBookings(30, apartmentName); // Generar 30 reservas de muestra para este apartamento
    
    // Filtrar según el rol
    const result = (role === 'admin' || isApartmentAllowedForUser(apartmentName))
      ? mockBookings
      : [];
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, result);
    }
    
    return result;
  }
};

// Obtener lista de apartamentos únicos según el rol del usuario con soporte para caché
export const fetchUniqueApartments = async (role: string | null = 'admin', useCache: boolean = true): Promise<string[]> => {
  const cacheKey = `apartments_${role}`;
  
  // Verificar si hay datos en caché y si debemos usarlos
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get<string[]>(cacheKey) || [];
  }
  
  try {
    // Si ya estamos usando datos de muestra, continuar con ellos
    if (usesMockData) {
      console.log(`[fetchUniqueApartments] Usando datos de muestra para rol: ${role}`);
      const mockApartments = [
        'Trindade 1', 'Trindade 2', 'Trindade 4', 'Trindade 5', 
        'White Cube', 'Blue Tile', 'I Love Lisboa'
      ];
      
      const result = role === 'admin'
        ? mockApartments
        : mockApartments.filter(apt => isApartmentAllowedForUser(apt));
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(cacheKey, result);
      }
      
      return result;
    }
    
    console.log(`[fetchUniqueApartments] Solicitando apartamentos con rol: ${role}`);
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
    let result: string[];
    
    // Filtrar los apartamentos según el rol
    if (role === 'user') {
      const filteredApartments = apartmentArray.filter(apt => isApartmentAllowedForUser(apt));
      console.log(`[fetchUniqueApartments] Rol user: Filtrando apartamentos ${filteredApartments.length} de ${apartmentArray.length}`);
      console.log('[fetchUniqueApartments] Apartamentos permitidos:', USER_ALLOWED_APARTMENTS);
      console.log('[fetchUniqueApartments] Apartamentos filtrados:', filteredApartments);
      result = filteredApartments;
    } else {
      console.log(`[fetchUniqueApartments] Rol admin: Devolviendo todos los apartamentos (${apartmentArray.length})`);
      result = apartmentArray;
    }
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error('[fetchUniqueApartments] Error al obtener la lista de apartamentos:', error);
    
    // Verificar si hay datos en caché a pesar del error
    if (cacheService.has(cacheKey)) {
      console.log('[fetchUniqueApartments] Usando datos de caché debido al error');
      return cacheService.get<string[]>(cacheKey) || [];
    }
    
    // Marcar que estamos usando datos de muestra
    usesMockData = true;
    console.log('[fetchUniqueApartments] Cambiando a datos de muestra');
    
    // Generar datos de muestra
    const mockApartments = [
      'Trindade 1', 'Trindade 2', 'Trindade 4', 'Trindade 5', 
      'White Cube', 'Blue Tile', 'I Love Lisboa'
    ];
    
    // Filtrar según el rol
    const result = role === 'admin'
      ? mockApartments
      : mockApartments.filter(apt => isApartmentAllowedForUser(apt));
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, result);
    }
    
    return result;
  }
};

// Función para registrar un log detallado de las columnas encontradas
export const analyzeTableColumns = async (): Promise<{ columnNames: string[], sampleValues: Record<string, any> }> => {
  try {
    if (usesMockData) {
      return { 
        columnNames: [
          'Apartamento', 'Huésped', 'Llegada', 'Salida', 'Portal de reserva',
          'Precio', 'Total', 'Comisión 20%', 'Pagado', 'Estado', 'Año', 'Mes'
        ],
        sampleValues: {} 
      };
    }
    
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
    console.error('[analyzeTableColumns] Error al analizar las columnas de la tabla:', error);
    usesMockData = true;
    return { 
      columnNames: [
        'Apartamento', 'Huésped', 'Llegada', 'Salida', 'Portal de reserva',
        'Precio', 'Total', 'Comisión 20%', 'Pagado', 'Estado', 'Año', 'Mes'
      ],
      sampleValues: {} 
    };
  }
};
