import * as airtableService from './airtableService';
import * as neonApiService from './neonApiService'; // Asumimos que este servicio también se ha simplificado
import { Booking, InventoryItem } from '@/types'; 

// Clave para almacenar la fuente de datos en localStorage
const DATA_SOURCE_KEY = 'airbnb_financial_data_source';

// Obtener la fuente de datos guardada en localStorage o usar 'airtable' como predeterminada
const getSavedDataSource = (): 'airtable' | 'neon' => {
  try {
    const saved = localStorage.getItem(DATA_SOURCE_KEY);
    return (saved === 'neon') ? 'neon' : 'airtable';
  } catch (e) {
    console.error('[dataRouterService] Error al leer localStorage:', e);
    return 'airtable';
  }
};

// Variable para almacenar la fuente de datos actual
let currentDataSource: 'airtable' | 'neon' = getSavedDataSource();

// Determina qué fuente de datos usar (ej. basado en una variable de entorno)
const getDataSource = (): 'airtable' | 'neon' => {
  return currentDataSource; // Usar la variable en lugar de un valor fijo
};

// Obtener el nombre de la fuente de datos actual (para UI)
export const getSourceName = (): string => {
  return getDataSource();
};

// Alternar entre fuentes de datos y devolver el nuevo valor
export const toggleDataSource = async (): Promise<string> => {
  // Guardar la fuente de datos anterior para comparar
  const previousDataSource = currentDataSource;
  
  // Si estamos en Airtable y queremos cambiar a Neon, verificar disponibilidad
  if (currentDataSource === 'airtable') {
    try {
      console.log('[dataRouterService] Verificando disponibilidad del servidor API de Neon...');
      const isAvailable = await neonApiService.checkApiAvailability();
      
      if (!isAvailable) {
        console.error('[dataRouterService] El servidor API de Neon no está disponible');
        alert('Error: El servidor API de Neon no está disponible. Se mantendrá Airtable como fuente de datos.');
        return currentDataSource; // Mantener Airtable
      }
      
      // Si está disponible, cambiar a Neon
      currentDataSource = 'neon';
    } catch (error) {
      console.error('[dataRouterService] Error al verificar disponibilidad de Neon:', error);
      alert('Error al conectar con el servidor de Neon. Se mantendrá Airtable como fuente de datos.');
      return currentDataSource; // Mantener Airtable
    }
  } else {
    // Si estamos en Neon, simplemente cambiar a Airtable
    currentDataSource = 'airtable';
  }
  
  // Guardar la fuente de datos en localStorage para que persista entre recargas
  try {
    localStorage.setItem(DATA_SOURCE_KEY, currentDataSource);
  } catch (e) {
    console.error('[dataRouterService] Error al guardar en localStorage:', e);
  }
  
  // Si la fuente de datos ha cambiado, limpiar todas las cachés
  if (previousDataSource !== currentDataSource) {
    try {
      // Importar cacheService
      const cacheService = await import('./cacheService').then(module => module.default);
      
      // Limpiar toda la caché
      console.log('[dataRouterService] Limpiando caché debido al cambio de fuente de datos...');
      cacheService.clear();
      
      // También limpiar cualquier caché específica
      cacheService.invalidateStartsWith('neon_api_');
      cacheService.invalidateStartsWith('airtable_');
      cacheService.invalidateStartsWith('monthly_data_');
      cacheService.invalidateStartsWith('yearly_comparison_');
      cacheService.invalidateStartsWith('booking_sources_');
    } catch (error) {
      console.error('[dataRouterService] Error al limpiar caché:', error);
    }
  }
  
  console.log(`[dataRouterService] Fuente de datos cambiada a: ${currentDataSource}`);
  return currentDataSource;
};

// --- Funciones de Booking --- 

export const fetchBookings = async (useCache: boolean = true): Promise<Booking[]> => {
  const source = getDataSource();
  console.log(`[dataRouterService] Obteniendo reservas con fuente de datos: ${source}`);
  try {
    let bookings: Booking[] = [];
    
    if (source === 'neon') {
      console.log('[dataRouterService] Intentando obtener reservas desde Neon API...');
      // Llamamos a fetchBookings sin parámetros de role
      bookings = await neonApiService.fetchBookings();
    } else {
      console.log('[dataRouterService] Intentando obtener reservas desde Airtable...');
      bookings = await airtableService.fetchBookings(useCache);
    }
    
    console.log(`[dataRouterService] Se obtuvieron ${bookings.length} reservas`);
    
    // Si no hay reservas, verificar si hay algún problema con Airtable
    if (bookings.length === 0) {
      console.warn('[dataRouterService] ⚠️ No se obtuvieron reservas. Verificando conexión con Airtable...');
      try {
        // Intentar analizar las columnas de Airtable para verificar la conexión
        const columnsInfo = await airtableService.analyzeTableColumns();
        console.log('[dataRouterService] Análisis de columnas de Airtable:', columnsInfo);
        
        if (columnsInfo && columnsInfo.columnNames && columnsInfo.columnNames.length > 0) {
          console.log('[dataRouterService] ✅ Conexión con Airtable correcta, pero no hay reservas.');
        } else {
          console.error('[dataRouterService] ❌ Posible problema con la conexión a Airtable.');
        }
      } catch (analyzeError) {
        console.error('[dataRouterService] Error al analizar columnas de Airtable:', analyzeError);
      }
    }
    
    return bookings;
  } catch (error) {
    console.error('[dataRouterService] Error al obtener reservas:', error);
    return [];
  }
};

export const fetchBookingsByApartment = async (apartmentName: string, useCache: boolean = true): Promise<Booking[]> => {
  const source = getDataSource();
  console.log(`[dataRouterService] Obteniendo reservas para ${apartmentName} con fuente: ${source}`);
  try {
    if (source === 'neon') {
      // Después de la refactorización, solo existe el rol admin
      // La función neonApiService.fetchBookingsByApartment todavía espera un rol
      return await neonApiService.fetchBookingsByApartment(apartmentName, 'admin', useCache) as unknown as Booking[];
    } else {
      // La función airtableService.fetchBookingsByApartment ya no espera un rol
      return airtableService.fetchBookingsByApartment(apartmentName, useCache);
    }
  } catch (error) {
    console.error(`[dataRouterService] Error al obtener reservas para ${apartmentName}:`, error);
    return [];
  }
};

export const fetchUniqueApartments = async (useCache: boolean = true): Promise<string[]> => {
  const source = getDataSource();
  console.log(`[dataRouterService] Obteniendo apartamentos únicos con fuente: ${source}`);
  try {
    if (source === 'neon') {
      // Añadimos el parámetro role='admin' que espera la función
      return await neonApiService.fetchUniqueApartments('admin', useCache);
    } else {
      return airtableService.fetchUniqueApartments(useCache);
    }
  } catch (error) {
    console.error('[dataRouterService] Error al obtener apartamentos únicos:', error);
    return [];
  }
};

// --- Funciones de Inventario --- 

// Función para mapear los datos de Neon al formato esperado por la aplicación
const mapNeonInventoryToAppFormat = (neonItems: any[]): InventoryItem[] => {
  return neonItems.map(item => {
    // Asegurar que el apartamento se mapee correctamente
    let apartamento = item.apartment || '';
    
    // Si el apartamento no tiene el formato "Apartamento X", intentar corregirlo
    if (apartamento && !apartamento.startsWith('Apartamento ')) {
      // Extraer el número si el formato es "Trindade X"
      if (apartamento.startsWith('Trindade ')) {
        const num = apartamento.replace('Trindade ', '');
        apartamento = `Apartamento ${num}`;
      }
      // Si es "I Love Lisboa", mantenerlo como está
    }
    
    return {
      id: item.id.toString(),
      nombre: item.name || '',
      apartamento: apartamento,
      categoria: item.category || '',
      subcategoria: item.subcategory || '',
      cantidad: item.quantity || 0,
      estado: mapNeonStatusToAppStatus(item.status),
      fechaAdquisicion: item.acquisitionDate || '',
      valorEstimado: item.value || 0,
      proveedor: item.supplier || '',
      numeroSerie: item.serialNumber || '',
      ubicacion: item.location || '',
      foto: item.photo ? [item.photo] : [],
      notas: item.description || '',
      ultimaActualizacion: item.lastUpdated || ''
    };
  });
};

// Función para mapear los estados de Neon a los estados de la aplicación
const mapNeonStatusToAppStatus = (status: string): 'Nuevo' | 'Buen Estado' | 'Usado' | 'Necesita Reparación' | 'Necesita Reemplazo' => {
  if (!status) return 'Buen Estado';
  
  switch (status.toLowerCase()) {
    case 'nuevo':
      return 'Nuevo';
    case 'activo':
    case 'good':
    case 'buen estado':
      return 'Buen Estado';
    case 'usado':
    case 'used':
      return 'Usado';
    case 'repair':
    case 'reparar':
    case 'necesita reparación':
      return 'Necesita Reparación';
    case 'replace':
    case 'reemplazar':
    case 'necesita reemplazo':
      return 'Necesita Reemplazo';
    default:
      return 'Buen Estado';
  }
};

// Obtener elementos del inventario
export const fetchInventoryItems = async (
  filters: Record<string, any> = {},
  useCache: boolean = true
): Promise<InventoryItem[]> => {
  const source = getDataSource();
  console.log(`[dataRouterService] Obteniendo inventario con filtros: ${JSON.stringify(filters)}, useCache: ${useCache}, source: ${source}`);
  
  try {
    if (source === 'neon') {
      // Añadimos el parámetro role='admin' y pasamos los filtros
      const items = await neonApiService.fetchInventoryItems('admin', filters, useCache);
      console.log(`[dataRouterService] Obtenidos ${items.length} elementos de inventario desde Neon`);
      
      // Mapear los datos de Neon al formato esperado por la aplicación
      const mappedItems = mapNeonInventoryToAppFormat(items);
      console.log(`[dataRouterService] Mapeados ${mappedItems.length} elementos de inventario de Neon al formato de la aplicación`);
      
      return mappedItems;
    } else {
      return airtableService.fetchInventoryItems(filters, useCache);
    }
  } catch (error) {
    console.error('[dataRouterService] Error al obtener inventario:', error);
    return [];
  }
};

// Función para mapear los datos de la aplicación al formato de Neon
const mapAppInventoryToNeonFormat = (appItem: Partial<InventoryItem>): any => {
  return {
    name: appItem.nombre || '',
    apartment: appItem.apartamento || '',
    category: appItem.categoria || '',
    subcategory: appItem.subcategoria || '',
    quantity: appItem.cantidad || 0,
    status: mapAppStatusToNeonStatus(appItem.estado),
    acquisitionDate: appItem.fechaAdquisicion || '',
    value: appItem.valorEstimado || 0,
    supplier: appItem.proveedor || '',
    serialNumber: appItem.numeroSerie || '',
    location: appItem.ubicacion || '',
    photo: appItem.foto && appItem.foto.length > 0 ? appItem.foto[0] : '',
    description: appItem.notas || '',
    lastUpdated: new Date().toISOString()
  };
};

// Función para mapear los estados de la aplicación a los estados de Neon
const mapAppStatusToNeonStatus = (status?: string): string => {
  if (!status) return 'Activo';
  
  switch (status) {
    case 'Nuevo':
      return 'Nuevo';
    case 'Buen Estado':
      return 'Activo';
    case 'Usado':
      return 'Usado';
    case 'Necesita Reparación':
      return 'Repair';
    case 'Necesita Reemplazo':
      return 'Replace';
    default:
      return 'Activo';
  }
};

// Crear un elemento de inventario
export const createInventoryItem = async (
  itemData: Partial<InventoryItem>
): Promise<InventoryItem | null> => {
  const source = getDataSource();
  console.log(`[dataRouterService] Creando elemento de inventario con fuente de datos: ${source}`);
  try {
    if (source === 'neon') {
      // Mapear los datos de la aplicación al formato de Neon
      const neonData = mapAppInventoryToNeonFormat(itemData);
      console.log(`[dataRouterService] Datos mapeados para crear en Neon:`, neonData);
      
      // Añadimos el parámetro role='admin' y un array vacío para accessibleApartments
      const newItem = await neonApiService.createInventoryItem(neonData, 'admin', []); 
      
      // Mapear el resultado de vuelta al formato de la aplicación
      if (newItem) {
        const mappedItem = mapNeonInventoryToAppFormat([newItem])[0];
        return mappedItem;
      }
      return null;
    } else {
      return airtableService.createInventoryItem(itemData);
    }
  } catch (error) {
    console.error('[dataRouterService] Error al crear elemento de inventario:', error);
    return null;
  }
};

// Actualizar un elemento de inventario
export const updateInventoryItem = async (
  itemId: string, 
  updates: Partial<InventoryItem>
): Promise<boolean> => { // Cambiado a Promise<boolean>
  const source = getDataSource();
  console.log(`[dataRouterService] Actualizando elemento de inventario ${itemId} con fuente: ${source}`);
  try {
    if (source === 'neon') {
      // Mapear los datos de la aplicación al formato de Neon
      const neonUpdates = mapAppInventoryToNeonFormat(updates);
      console.log(`[dataRouterService] Datos mapeados para actualizar en Neon:`, neonUpdates);
      
      // Añadimos el parámetro role='admin' y un array vacío para accessibleApartments
      const result = await neonApiService.updateInventoryItem(itemId, neonUpdates, 'admin', []); 
      // updateInventoryItem en neonApiService devuelve el item actualizado, no un boolean
      return result !== null;
    } else {
      // airtableService.updateInventoryItem devuelve boolean
      return await airtableService.updateInventoryItem(itemId, updates);
    }
  } catch (error) {
    console.error(`[dataRouterService] Error al actualizar elemento de inventario ${itemId}:`, error);
    return false;
  }
};

// Eliminar un elemento de inventario
export const deleteInventoryItem = async (
  itemId: string 
): Promise<boolean> => {
  const source = getDataSource();
  console.log(`[dataRouterService] Eliminando elemento de inventario ${itemId} con fuente: ${source}`);
  try {
    if (source === 'neon') {
      // Añadimos el parámetro role='admin' y un array vacío para accessibleApartments
      const result = await neonApiService.deleteInventoryItem(itemId, 'admin', []);
      console.log(`[dataRouterService] Resultado de eliminar elemento ${itemId} en Neon:`, result);
      return result === true;
    } else {
      return await airtableService.deleteInventoryItem(itemId);
    }
  } catch (error) {
    console.error(`[dataRouterService] Error al eliminar elemento de inventario ${itemId}:`, error);
    return false;
  }
};
