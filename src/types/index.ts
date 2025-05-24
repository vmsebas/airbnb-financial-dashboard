export interface Booking {
  id: string;
  createdAt: string;
  checkIn: string;
  checkOut: string;
  position?: string;
  apartment: string;
  guest?: string;
  email?: string;
  phone?: string;
  address?: string;
  adults: number;
  nights: number;
  children: number;
  status: 'Reservado' | 'Cancelado' | 'Bloqueado' | string;
  bookingPortal: string;
  airbnbNights?: number;
  bookingNights?: number;
  moreThan7Nights?: number;
  checkInTime: string;
  checkOutTime: string;
  price: number;
  nightlyAverage: number;
  cleaningFee: number;
  commission: number;
  total: number;
  totalWithTax: number;
  cityTax?: number;
  paid: boolean;
  notes?: string;
  year: number;
  month: string;
  profit: number;
  
  // Columnas adicionales que podrían existir
  guests?: number;           // Total de huéspedes
  paymentMethod?: string;    // Método de pago
  invoiceNumber?: string;    // Número de factura
  invoiceDate?: string;      // Fecha de factura
  vatNumber?: string;        // Número de IVA
  deposit?: number;          // Depósito
  depositPaid?: boolean;     // Depósito pagado
  balance?: number;          // Saldo pendiente
  balanceDueDate?: string;   // Fecha de vencimiento del saldo
  specialRequests?: string;  // Solicitudes especiales
  arrivalTime?: string;      // Hora estimada de llegada
  departureTime?: string;    // Hora estimada de salida
  nationality?: string;      // Nacionalidad
  language?: string;         // Idioma preferido
  passportNumber?: string;   // Número de pasaporte
  idNumber?: string;         // Número de identificación
  bookingDate?: string;      // Fecha de la reserva
  channelManager?: string;   // Gestor de canales
  promotion?: string;        // Promoción aplicada
  discountAmount?: number;   // Importe del descuento
  discountReason?: string;   // Razón del descuento
  reviewScore?: number;      // Puntuación de la reseña
  reviewComment?: string;    // Comentario de la reseña
  returnGuest?: boolean;     // Cliente recurrente
  assignedStaff?: string;    // Personal asignado
  maintenanceNeeded?: string; // Mantenimiento necesario
  occupancy?: number;        // Tasa de ocupación (para datos comparativos)
}

export interface ApartmentSummary {
  name: string;
  bookings: number;
  totalRevenue: number;
  averageNightlyRate: number;
  occupancyRate: number;
  totalNights: number;
  averageStay: number;
}

export interface BookingSource {
  name: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
  averageRate: number;
}

export interface YearlyData {
  year: number;
  months: MonthlyData[];
  totalRevenue: number;
  totalBookings: number;
  averageOccupancy: number;
}
