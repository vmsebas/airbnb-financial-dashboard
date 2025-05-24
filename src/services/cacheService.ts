// Sistema de caché para almacenar datos y mejorar la experiencia de usuario
// al reducir los tiempos de carga

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // Tiempo de expiración en milisegundos
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private static instance: CacheService;
  
  // Tiempo de expiración predeterminado: 5 minutos
  private defaultExpiry = 5 * 60 * 1000;
  
  private constructor() {}
  
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  
  /**
   * Guarda datos en la caché con una clave específica
   * @param key Clave para identificar los datos
   * @param data Datos a almacenar
   * @param expiry Tiempo de expiración en milisegundos (opcional)
   */
  public set<T>(key: string, data: T, expiryInSeconds: number = 300): void {
    const expiryMs = expiryInSeconds * 1000;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiryMs
    });
    
    console.log(`[CacheService] Datos guardados en caché: ${key} (expira en ${expiryInSeconds}s)`);
  }
  
  /**
   * Obtiene datos de la caché
   * @param key Clave para identificar los datos
   * @returns Los datos almacenados o null si no existen o han expirado
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`[CacheService] No hay datos en caché para: ${key}`);
      return null;
    }
    
    const now = Date.now();
    if (now - item.timestamp > item.expiry) {
      console.log(`[CacheService] Datos expirados para: ${key} (edad: ${(now - item.timestamp)/1000}s)`);
      this.cache.delete(key);
      return null;
    }
    
    const age = Math.round((now - item.timestamp)/1000);
    console.log(`[CacheService] Datos recuperados de caché: ${key} (edad: ${age}s, expira en: ${Math.round((item.expiry - (now - item.timestamp))/1000)}s)`);
    return item.data as T;
  }
  
  /**
   * Comprueba si hay datos en caché y no han expirado
   * @param key Clave para identificar los datos
   * @returns true si hay datos válidos, false en caso contrario
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    const now = Date.now();
    if (now - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Elimina datos de la caché
   * @param key Clave para identificar los datos
   */
  public delete(key: string): void {
    this.cache.delete(key);
    console.log(`[CacheService] Datos eliminados de caché: ${key}`);
  }
  
  /**
   * Limpia toda la caché
   */
  public clear(): void {
    this.cache.clear();
    console.log(`[CacheService] Caché limpiada completamente`);
  }
  
  /**
   * Genera una clave de caché basada en filtros
   * @param baseKey Clave base
   * @param filters Objeto de filtros
   * @returns Clave única para los filtros
   */
  public generateKey(baseKey: string, filters: any): string {
    const filterString = JSON.stringify(filters);
    return `${baseKey}_${filterString}`;
  }
}

export default CacheService.getInstance();
