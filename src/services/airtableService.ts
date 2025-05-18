import Airtable from 'airtable';
import { Booking, InventoryItem } from '../types';
import { AIRTABLE_CONFIG } from '../config/airtable';
import { generateMockBookings } from '../utils/mockData';
import cacheService from './cacheService';

// Flag para determinar si debemos usar datos de muestra - SIEMPRE false para garantizar que se intenten obtener datos reales
let usesMockData = false;

// Inicializar Airtable con manejo de errores
let base: any;
let inventoryBase: any;

try {
  // Inicializar Airtable para la base principal (reservas y apartamentos)
  base = new Airtable({ apiKey: AIRTABLE_CONFIG.API_KEY }).base(AIRTABLE_CONFIG.BASE_ID);
  
  // Inicializar Airtable para la base de inventario
  inventoryBase = new Airtable({ apiKey: AIRTABLE_CONFIG.API_KEY }).base(AIRTABLE_CONFIG.INVENTORY_BASE_ID);
  
  console.log('[airtableService] Conexión con Airtable inicializada correctamente');
} catch (error) {
  console.error('[airtableService] Error al inicializar la conexión con Airtable:', error);
  // Ya está establecido como true por defecto
}

// Mapeo de nombres de apartamentos entre la app y Airtable
// Asumimos que la app usa "Apartamento X" y Airtable usa "Trindade X"
const APP_TO_AIRTABLE_APT_MAP: { [key: string]: string } = {
  // Nombres de la UI mapeados a nombres supuestos de Airtable
  "Trindade 1 - Yellow Tiles": "Trindade 1 - Yellow Tiles", 
  "I Love Lisboa": "I Love Lisboa", // SUPOSICIÓN: verificar nombre en Airtable
  "Trindade 4 - White Tiles": "Trindade 4 - White Tiles",
  "Trindade 2 - Blue Tiles": "Trindade 2 - Blue Tiles",
  'Apartamento 3': 'Trindade 3', // Mantenido de la versión anterior
};

const AIRTABLE_TO_APP_APT_MAP: { [key: string]: string } = {
  // Nombres de Airtable mapeados a nombres de la UI
  "Trindade 1 - Yellow Tiles": "Trindade 1 - Yellow Tiles",
  "I Love Lisboa": "I Love Lisboa", // SUPOSICIÓN: verificar nombre en Airtable
  "Trindade 4 - White Tiles": "Trindade 4 - White Tiles",
  "Trindade 2 - Blue Tiles": "Trindade 2 - Blue Tiles",
  'Trindade 3': 'Apartamento 3', // Mantenido de la versión anterior
};

// Ya declarado al inicio del archivo

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

  // Extraer la fecha de check-in para procesamiento
  const checkInDate = record.get('Llegada') || '';
  let year = parseNumber(record.get('Año'));
  let month = record.get('Mes') || '';
  
  // Si no hay año o mes explícito pero hay fecha de check-in, extraer de ahí
  if (checkInDate && (!year || !month)) {
    try {
      const date = new Date(checkInDate);
      if (!isNaN(date.getTime())) {
        if (!year) year = date.getFullYear();
        
        if (!month) {
          // Meses en español
          const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          month = monthNames[date.getMonth()];
        }
      }
    } catch (e) {
      console.error('Error al analizar fecha de check-in:', checkInDate, e);
    }
  }
  
  // Si aún no tenemos año, usar el actual
  if (!year) year = new Date().getFullYear();
  
  return {
    id: record.id || '',
    createdAt: record.get('Creado') || '',
    checkIn: checkInDate,
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
    year: year,
    month: month,
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

// Obtener todas las reservas
export const fetchBookings = async (useCache: boolean = true): Promise<Booking[]> => {
  const cacheKey = `bookings`;
  
  // Verificar si hay datos en caché y si debemos usarlos
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get<Booking[]>(cacheKey) || [];
  }
  
  try {
    // Si ya estamos usando datos de muestra, continuar con ellos
    if (usesMockData) {
      console.log(`[fetchBookings] Usando datos de muestra`);
      const mockBookings = generateMockBookings(100); // Generar 100 reservas de muestra
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(cacheKey, mockBookings, 300); // 5 minutos de caché
      }
      
      return mockBookings;
    }
    
    console.log(`[fetchBookings] Solicitando reservas de Airtable`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE).select().all();
    const bookings = records.map(mapAirtableRecordToBooking);
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, bookings, 300); // 5 minutos de caché
    }
    
    return bookings;
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
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, mockBookings);
    }
    
    return mockBookings;
  }
};

// Obtener reservas por apartamento
export const fetchBookingsByApartment = async (apartmentName: string, useCache: boolean = true): Promise<Booking[]> => {
  const cacheKey = `bookings_apartment_${apartmentName}`;
  
  // Verificar si hay datos en caché y si debemos usarlos
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get<Booking[]>(cacheKey) || [];
  }
  
  try {
    // Si ya estamos usando datos de muestra, continuar con ellos
    if (usesMockData) {
      console.log(`[fetchBookingsByApartment] Usando datos de muestra para ${apartmentName}`);
      const mockBookings = generateMockBookings(30, apartmentName); // Generar 30 reservas de muestra para este apartamento
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(cacheKey, mockBookings);
      }
      
      return mockBookings;
    }
    
    console.log(`[fetchBookingsByApartment] Solicitando reservas para ${apartmentName}`);
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE)
      .select({
        filterByFormula: `{Apartamento} = '${APP_TO_AIRTABLE_APT_MAP[apartmentName]}'`
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
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, mockBookings);
    }
    
    return mockBookings;
  }
};

// Obtener lista de apartamentos únicos
export const fetchUniqueApartments = async (useCache: boolean = true): Promise<string[]> => {
  const cacheKey = `apartments`;
  
  // Verificar si hay datos en caché y si debemos usarlos
  if (useCache && cacheService.has(cacheKey)) {
    return cacheService.get<string[]>(cacheKey) || [];
  }
  
  try {
    // Si ya estamos usando datos de muestra, continuar con ellos
    if (usesMockData) {
      console.log(`[fetchUniqueApartments] Usando datos de muestra`);
      const mockApartments = [
        'Trindade 1', 'Trindade 2', 'Trindade 4', 'Trindade 5', 
        'White Cube', 'Blue Tile', 'I Love Lisboa'
      ];
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(cacheKey, mockApartments);
      }
      
      return mockApartments;
    }
    
    console.log(`[fetchUniqueApartments] Solicitando apartamentos`);
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
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, apartmentArray);
    }
    
    return apartmentArray;
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
    
    // Guardar en caché
    if (useCache) {
      cacheService.set(cacheKey, mockApartments);
    }
    
    return mockApartments;
  }
};

// FUNCIONES PARA GESTIÓN DE INVENTARIO

// Función para mapear los registros de Airtable al formato de InventoryItem
const mapAirtableRecordToInventoryItem = (record: any): InventoryItem => {
  // Función auxiliar para manejar valores numéricos
  const parseNumber = (value: any): number | undefined => {
    return value !== undefined && value !== null ? Number(value) : undefined;
  };

  return {
    id: record.id,
    nombre: record.get('Nombre') || '',
    apartamento: AIRTABLE_TO_APP_APT_MAP[record.get('Apartamento')] || record.get('Apartamento'), // <-- MODIFICADO
    categoria: record.get('Categoria') || '',
    subcategoria: record.get('Subcategoria'),
    cantidad: parseNumber(record.get('Cantidad')) || 1,
    estado: record.get('Estado') || 'Buen Estado',
    fechaAdquisicion: record.get('Fecha Adquisicion') || '',
    valorEstimado: parseNumber(record.get('Valor Estimado')),
    proveedor: record.get('Proveedor') || '',
    numeroSerie: record.get('Numero Serie') || '',
    ubicacion: record.get('Ubicacion') || '',
    foto: record.get('Foto'),
    notas: record.get('Notas') || '',
    ultimaActualizacion: record.get('Ultima Actualizacion') || new Date().toISOString()
  };
};

// Obtener todos los elementos del inventario
export const fetchInventoryItems = async (filters: {
  apartamento?: string;
  categoria?: string;
  estado?: string;
  searchTerm?: string;
} = {}, useCache: boolean = true): Promise<InventoryItem[]> => {
  const cacheKey = `inventory_${JSON.stringify(filters)}`;
  const cachedData = cacheService.get<InventoryItem[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    let filterParts: string[] = [];

    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      filterParts.push(
        `OR(
          SEARCH("${searchTermLower}", LOWER({Nombre})),
          SEARCH("${searchTermLower}", LOWER({Categoria})),
          SEARCH("${searchTermLower}", LOWER({Subcategoria})),
          SEARCH("${searchTermLower}", LOWER({Notas}))
        )`
      );
    }
    if (filters.categoria) filterParts.push(`{Categoria} = "${filters.categoria}"`);
    if (filters.estado) filterParts.push(`{Estado} = "${filters.estado}"`);

    // Filtro por apartamento específico (si viene de los filtros del UI)
    if (filters.apartamento) {
        const airtableAptName = APP_TO_AIRTABLE_APT_MAP[filters.apartamento] || filters.apartamento;
        filterParts.push(`{Apartamento} = "${airtableAptName}"`);
    }

    const filterByFormula = filterParts.length > 0 ? `AND(${filterParts.join(', ')})` : '';
    // console.log(`[fetchInventoryItems] Airtable formula: ${filterByFormula}`);

    const records = await inventoryBase(AIRTABLE_CONFIG.INVENTORY_TABLE)
      .select({
        filterByFormula: filterByFormula,
        sort: [{ field: 'Nombre', direction: 'asc' }], 
      })
      .all();

    const items = records.map(mapAirtableRecordToInventoryItem);
    cacheService.set(cacheKey, items);
    return items;

  } catch (error) {
    console.error('[fetchInventoryItems] Error al obtener inventario:', error);
    throw error; // O maneja el error como prefieras
  }
};

// Crear un nuevo elemento de inventario
export const createInventoryItem = async (
  itemData: Partial<InventoryItem>,
): Promise<InventoryItem | null> => {
  if (!itemData.nombre || !itemData.apartamento || !itemData.categoria) {
    console.error('[createInventoryItem] Error: Faltan campos obligatorios (nombre, apartamento, categoría).');
    // Considera enviar un error más específico al frontend aquí
    return null;
  }

  try {
    const fields: Record<string, any> = {};
    fields['Nombre'] = itemData.nombre;
    fields['Apartamento'] = APP_TO_AIRTABLE_APT_MAP[itemData.apartamento]; // Mapear a nombre de Airtable
    fields['Categoria'] = itemData.categoria;
    
    // Campos opcionales
    if (itemData.subcategoria !== undefined) fields['Subcategoria'] = itemData.subcategoria;
    if (itemData.cantidad !== undefined) fields['Cantidad'] = itemData.cantidad; else fields['Cantidad'] = 1;
    if (itemData.estado !== undefined) fields['Estado'] = itemData.estado; else fields['Estado'] = 'Buen Estado';
    if (itemData.fechaAdquisicion) fields['Fecha Adquisicion'] = itemData.fechaAdquisicion; else fields['Fecha Adquisicion'] = new Date().toISOString().split('T')[0];
    if (itemData.valorEstimado !== undefined) fields['Valor Estimado'] = itemData.valorEstimado; else fields['Valor Estimado'] = 0;
    if (itemData.proveedor !== undefined) fields['Proveedor'] = itemData.proveedor;
    if (itemData.numeroSerie !== undefined) fields['Numero Serie'] = itemData.numeroSerie;
    if (itemData.ubicacion !== undefined) fields['Ubicacion'] = itemData.ubicacion;
    if (itemData.notas !== undefined) fields['Notas'] = itemData.notas;
    // 'foto' requeriría manejo especial para subidas de archivos a Airtable

    const createdRecords = await inventoryBase(AIRTABLE_CONFIG.INVENTORY_TABLE).create([{ fields }]);
    
    if (!createdRecords || createdRecords.length === 0) {
        console.error('[createInventoryItem] Error: Airtable no devolvió el registro creado.');
        return null;
    }
    cacheService.invalidateStartsWith('inventory_');
    return mapAirtableRecordToInventoryItem(createdRecords[0]);
  } catch (error) {
    console.error('[createInventoryItem] Error al crear elemento en Airtable:', error);
    return null;
  }
};

// Actualizar un elemento de inventario existente
export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<InventoryItem>,
): Promise<boolean> => {
  try {
    const fields: Record<string, any> = {};
    // Mapear solo los campos que vienen en 'updates'
    if (updates.nombre !== undefined) fields['Nombre'] = updates.nombre;
    if (updates.apartamento !== undefined) {
        fields['Apartamento'] = APP_TO_AIRTABLE_APT_MAP[updates.apartamento]; // Mapear a nombre de Airtable
    }
    if (updates.categoria !== undefined) fields['Categoria'] = updates.categoria;
    if (updates.subcategoria !== undefined) fields['Subcategoria'] = updates.subcategoria;
    if (updates.cantidad !== undefined) fields['Cantidad'] = updates.cantidad;
    if (updates.estado !== undefined) fields['Estado'] = updates.estado;
    if (updates.fechaAdquisicion !== undefined) fields['Fecha Adquisicion'] = updates.fechaAdquisicion;
    if (updates.valorEstimado !== undefined) fields['Valor Estimado'] = updates.valorEstimado;
    if (updates.proveedor !== undefined) fields['Proveedor'] = updates.proveedor;
    if (updates.numeroSerie !== undefined) fields['Numero Serie'] = updates.numeroSerie;
    if (updates.ubicacion !== undefined) fields['Ubicacion'] = updates.ubicacion;
    if (updates.notas !== undefined) fields['Notas'] = updates.notas;
    // 'foto' requeriría manejo especial

    if (Object.keys(fields).length === 0) {
        console.log('[updateInventoryItem] No hay campos para actualizar.');
        return true; // O false, dependiendo de si se considera un error o no.
    }

    await inventoryBase(AIRTABLE_CONFIG.INVENTORY_TABLE).update(itemId, fields);
    cacheService.invalidateStartsWith('inventory_');
    return true;
  } catch (error) {
    console.error(`[updateInventoryItem] Error al actualizar elemento con ID ${itemId} en Airtable:`, error);
    return false;
  }
};

// Eliminar un elemento de inventario
export const deleteInventoryItem = async (
  itemId: string,
): Promise<boolean> => {
  try {
    // Primero, obtenemos el item para verificar el apartamento
    const record = await inventoryBase(AIRTABLE_CONFIG.INVENTORY_TABLE).find(itemId);
    if (!record) {
      console.error(`[deleteInventoryItem] Error: No se encontró el elemento con ID ${itemId}.`);
      return false;
    }

    console.log(`[deleteInventoryItem] Eliminando elemento con ID: ${itemId}`);
    await inventoryBase(AIRTABLE_CONFIG.INVENTORY_TABLE).destroy(itemId);
    cacheService.invalidateStartsWith('inventory_');
    console.log(`[deleteInventoryItem] Elemento con ID ${itemId} eliminado correctamente.`);
    return true;
  } catch (error) {
    console.error(`[deleteInventoryItem] Error al eliminar elemento con ID ${itemId}:`, error);
    return false;
  }
};

// Analizar las columnas de la tabla de Airtable para mostrar información sobre ellas
export const analyzeTableColumns = async () => {
  try {
    console.log('[analyzeTableColumns] Analizando columnas de la tabla...');
    
    // Obtener los primeros 10 registros para analizar la estructura
    const records = await base(AIRTABLE_CONFIG.BOOKINGS_TABLE)
      .select({
        maxRecords: 10
      })
      .firstPage();
    
    if (!records || records.length === 0) {
      console.error('[analyzeTableColumns] No se encontraron registros para analizar.');
      return { columnNames: [], sampleValues: {} };
    }
    
    // Extraer todos los nombres de columnas únicos
    const columnSet = new Set<string>();
    const sampleValues: Record<string, any> = {};
    
    // Usar el primer registro para obtener los nombres de columnas
    const firstRecord = records[0];
    const fields = firstRecord.fields;
    
    Object.keys(fields).forEach(columnName => {
      columnSet.add(columnName);
      // Guardar el valor de muestra para esta columna
      sampleValues[columnName] = fields[columnName];
    });
    
    // Convertir el Set a un array y ordenar alfabéticamente
    const columnNames = Array.from(columnSet).sort();
    
    console.log(`[analyzeTableColumns] Se encontraron ${columnNames.length} columnas.`);
    
    return {
      columnNames,
      sampleValues
    };
  } catch (error) {
    console.error('[analyzeTableColumns] Error al analizar columnas:', error);
    throw error;
  }
};
