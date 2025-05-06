
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bookings } from '@/services/dataService';

const GuestsPage = () => {
  // Extract unique guests and their bookings
  const guestsMap = new Map();
  
  bookings.forEach(booking => {
    if (booking.guest) {
      if (!guestsMap.has(booking.guest)) {
        guestsMap.set(booking.guest, {
          name: booking.guest,
          bookings: 0,
          totalNights: 0,
          totalSpent: 0,
          lastVisit: '',
          apartments: new Set(),
        });
      }
      
      const guestData = guestsMap.get(booking.guest);
      guestData.bookings += 1;
      guestData.totalNights += booking.nights;
      guestData.totalSpent += booking.price;
      
      // Track the latest visit
      if (!guestData.lastVisit || new Date(booking.checkIn) > new Date(guestData.lastVisit)) {
        guestData.lastVisit = booking.checkIn;
      }
      
      guestData.apartments.add(booking.apartment);
    }
  });
  
  const guestsList = Array.from(guestsMap.values()).map(guest => ({
    ...guest,
    apartments: Array.from(guest.apartments),
  }));
  
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rental-dark">Huéspedes</h1>
        <p className="text-gray-500">Información y análisis de huéspedes</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Listado de Huéspedes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Noches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gasto Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Visita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apartamentos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guestsList.map((guest, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-rental-dark">
                        {guest.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.totalNights}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatter.format(guest.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.lastVisit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {guest.apartments.map((apartment, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                            >
                              {apartment.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GuestsPage;
