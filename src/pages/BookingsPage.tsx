
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookingList } from '@/components/apartment/BookingList';
import { bookings } from '@/services/dataService';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart, FileText, CalendarDays, Users } from 'lucide-react';

const BookingsPage = () => {
  // Calculate some basic stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);
  const averageStay = totalNights / totalBookings || 0;
  
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
  
  return (
    <MainLayout showFilters={true}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rental-dark">Todas las Reservas</h1>
        <p className="text-gray-500">Listado completo de reservas en todos los apartamentos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Reservas" 
          value={totalBookings}
          icon={<FileText size={20} />}
        />
        <StatCard 
          title="Ingresos Totales" 
          value={formatter.format(totalRevenue)}
          icon={<BarChart size={20} />}
        />
        <StatCard 
          title="Noches Totales" 
          value={totalNights}
          icon={<CalendarDays size={20} />}
        />
        <StatCard 
          title="Estancia Promedio" 
          value={`${averageStay.toFixed(1)} noches`}
          icon={<Users size={20} />}
        />
      </div>
      
      <BookingList bookings={bookings} />
    </MainLayout>
  );
};

export default BookingsPage;
