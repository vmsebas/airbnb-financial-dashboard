// Utilidades para formatear números y valores en formato europeo

// Formateador de moneda (EUR) en formato europeo
export const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// Formateador de números con 1 decimal en formato europeo
export const decimal1Formatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

// Formateador de números con 0 decimales en formato europeo
export const integerFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

// Formateador de porcentajes con 1 decimal en formato europeo
export const percentFormatter = (value: number): string => {
  return `${decimal1Formatter.format(value)}%`;
};

// Formateador de porcentajes sin decimales en formato europeo
export const percentIntFormatter = (value: number): string => {
  return `${integerFormatter.format(value)}%`;
};