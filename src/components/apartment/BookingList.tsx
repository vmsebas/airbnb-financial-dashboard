
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useFilters } from '@/context/FilterContext';

interface BookingListProps {
  bookings: Booking[];
  apartmentName?: string;
}

// Lista de apartamentos permitidos para usuarios normales
const USER_ALLOWED_APARTMENTS = ['Trindade 1', 'Trindade 2', 'Trindade 4'];

const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

export const BookingList: React.FC<BookingListProps> = ({ bookings, apartmentName }) => {
  const { role } = useAuth();
  const { appliedFilters, viewContext } = useFilters();
  
  // Si estamos en una página de detalle y el usuario no tiene acceso a este apartamento
  if (apartmentName && role === 'user') {
    const isAllowed = USER_ALLOWED_APARTMENTS.some(allowed => 
      apartmentName.includes(allowed)
    );
    
    if (!isAllowed) {
      console.log(`BookingList - Usuario no autorizado para ver: ${apartmentName}, redirigiendo...`);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Generar un título que incluya información del período y del contexto
  const getBookingListTitle = () => {
    let title = "Reservas";
    
    if (viewContext === 'detail' && apartmentName) {
      title += ` - ${apartmentName}`;
    }
    
    if (appliedFilters.month) {
      title += ` - ${appliedFilters.month} ${appliedFilters.year}`;
    } else {
      title += ` - ${appliedFilters.year}`;
    }
    
    return title;
  };
  
  console.log(`BookingList - Mostrando ${bookings.length} reservas para ${apartmentName || 'todos los apartamentos'}`);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{getBookingListTitle()}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Huésped
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Noches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.guest || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.nights}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${booking.bookingPortal === 'Airbnb' ? 'bg-rental-primary text-white' : 
                          booking.bookingPortal === 'Booking.com' ? 'bg-rental-info text-white' : 
                          'bg-rental-secondary text-white'}
                      `}>
                        {booking.bookingPortal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatter.format(booking.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${booking.status === 'Reservado' ? 'bg-rental-success/20 text-rental-success' : 'bg-red-100 text-red-800'}
                      `}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay reservas disponibles para el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
