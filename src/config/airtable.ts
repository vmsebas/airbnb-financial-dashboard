
// Configuración de Airtable
export const AIRTABLE_CONFIG = {
  API_KEY: 'pat31y7dsHB8lxZSF.04249c39f2180e2f3e32ec3fba5c651e29323433af84e257efd907ff590e765e',
  BASE_ID: 'appUS95OU04tB4IYH',
  BOOKINGS_TABLE: 'Reservas',  // Nombre de la tabla en Airtable
  APARTMENTS_TABLE: 'Apartamentos'  // Por si tienes una tabla separada para apartamentos
};

export const isAirtableConfigured = (): boolean => {
  return Boolean(AIRTABLE_CONFIG.API_KEY && AIRTABLE_CONFIG.BASE_ID);
};
