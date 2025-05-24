import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookingList } from '@/components/apartment/BookingList';
import { fetchBookings } from '@/services/airtableService';
import { Booking } from '@/types';
import { useFilters } from '@/context/FilterContext';
import { filterBookings as applyBookingFilters } from '@/utils/filterUtils';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart, FileText, CalendarDays, Users } from 'lucide-react';

const BookingsPage = () => {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appliedFilters } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const fetchedData = await fetchBookings();
        setAllBookings(fetchedData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar las reservas en BookingsPage:', err);
        setError('No se pudieron cargar las reservas. Inténtalo más tarde.');
        setAllBookings([]); 
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayedBookings = applyBookingFilters(allBookings, appliedFilters);

  const totalBookings = displayedBookings.length;
  const totalRevenue = displayedBookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalNights = displayedBookings.reduce((sum, booking) => sum + booking.nights, 0);
  const averageStay = totalBookings > 0 ? totalNights / totalBookings : 0; 
  
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  if (loading) {
    return (
      <MainLayout showFilters={true}>
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Cargando todas las reservas...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout showFilters={true}>
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout showFilters={true}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rental-dark">Todas las Reservas</h1>
        <p className="text-gray-500">Listado completo de reservas en todos los apartamentos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Reservas (Filtradas)" 
          value={totalBookings}
          icon={<FileText size={20} />}
        />
        <StatCard 
          title="Ingresos Totales (Filtrados)" 
          value={formatter.format(totalRevenue)}
          icon={<BarChart size={20} />}
        />
        <StatCard 
          title="Noches Totales (Filtradas)" 
          value={totalNights}
          icon={<CalendarDays size={20} />}
        />
        <StatCard 
          title="Estancia Promedio (Filtrada)" 
          value={`${averageStay.toFixed(1)} noches`}
          icon={<Users size={20} />}
        />
      </div>
      
      <BookingList bookings={displayedBookings} /> 
    </MainLayout>
  );
};

export default BookingsPage;
