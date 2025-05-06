// Configuración de autenticación
// En una aplicación real, estas credenciales deberían estar en el backend
// y nunca expuestas en el frontend

// Función para generar un hash simple (solo para demostración)
// En producción, usar algoritmos criptográficos adecuados como bcrypt
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return hash.toString(16); // Convertir a hexadecimal
};

// Credenciales hasheadas
export const AUTH_CONFIG = {
  // En una aplicación real, estos hashes se generarían en el backend
  // y se almacenarían en una base de datos
  ADMIN_HASH: simpleHash("admin123"), // Hash de "admin123"
  USER_HASH: simpleHash("user123"),   // Hash de "user123"
  
  // Función para verificar contraseñas
  verifyPassword: (password: string, role: "admin" | "user"): boolean => {
    // Acceso rápido para desarrollo - permite usar "admin" o "user" como contraseña directa
    if ((password === "admin" && role === "admin") || (password === "user" && role === "user")) {
      return true;
    }
    
    const passwordHash = simpleHash(password);
    
    if (role === "admin") {
      return passwordHash === AUTH_CONFIG.ADMIN_HASH;
    } else if (role === "user") {
      return passwordHash === AUTH_CONFIG.USER_HASH;
    }
    
    return false;
  }
};
