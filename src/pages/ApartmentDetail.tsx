import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchBookingsByApartment } from '@/services/airtableService';
import { ApartmentStats } from '@/components/apartment/ApartmentStats';
import { BookingList } from '@/components/apartment/BookingList';
import { filterBookings } from '@/utils/filterUtils';
import { useFilters } from '@/context/FilterContext';
import { useAuth } from '@/context/AuthContext';
import { ApartmentSummary, Booking } from '@/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

const ApartmentDetail = () => {
  const { apartmentName } = useParams<{ apartmentName: string }>();
  const decodedApartmentName = apartmentName ? decodeURIComponent(apartmentName) : '';
  const { filters, appliedFilters, setFilters, applyFilters } = useFilters();
  const { role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dashboardPath = '/admin';
  
  console.log(`ApartmentDetail - Cargando apartamento: ${decodedApartmentName}, rol: ${role}`);
  
  useEffect(() => {
    const loadData = async () => {
      if (!decodedApartmentName) return;
      
      try {
        setLoading(true);
        console.log(`ApartmentDetail - Solicitando reservas para ${decodedApartmentName}`);
        const fetchedBookings = await fetchBookingsByApartment(decodedApartmentName);
        console.log(`ApartmentDetail - Recibidas ${fetchedBookings.length} reservas para ${decodedApartmentName}`);
        setBookings(fetchedBookings);
      } catch (err) {
        console.error('Error al cargar los datos del apartamento:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [decodedApartmentName]);

  // Aplicar filtros EXCEPTO el de apartamento (ya que estamos en la página de ese apartamento)
  const getApartmentFilteredBookings = () => {
    if (!decodedApartmentName) return [];
    
    // Aseguramos que las reservas sean del apartamento actual, independientemente
    // del filtro de apartamento aplicado globalmente
    const apartmentBookings = bookings.filter(booking => booking.apartment === decodedApartmentName);
    
    // Aplicamos los demás filtros (año, mes, fuente de reserva, etc.)
    // pero excluimos el filtro de apartamento
    const relevantFilters = {
      ...appliedFilters,
      apartment: null // Ignoramos el filtro de apartamento
    };
    
    return filterBookings(apartmentBookings, relevantFilters);
  };

  const filteredBookings = getApartmentFilteredBookings();
  console.log(`ApartmentDetail - Filtrando reservas: ${filteredBookings.length} de ${bookings.length}`);

  // Calcular las estadísticas específicas del apartamento actual
  const calculateApartmentSummary = (apartmentBookings: Booking[]): ApartmentSummary => {
    if (apartmentBookings.length === 0) {
      return {
        name: decodedApartmentName,
        bookings: 0,
        totalRevenue: 0,
        averageNightlyRate: 0,
        occupancyRate: 0,
        totalNights: 0,
        averageStay: 0
      };
    }

    const totalBookings = apartmentBookings.length;
    const totalRevenue = apartmentBookings.reduce((sum, booking) => sum + booking.price, 0);
    const totalNights = apartmentBookings.reduce((sum, booking) => sum + booking.nights, 0);
    
    // Calcular tarifa promedio por noche
    const averageNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
    
    // Para el cálculo de ocupación, consideramos los filtros de fecha activos
    let daysInPeriod = 365; // Por defecto, un año completo
    
    // Si hay un mes específico, calculamos los días de ese mes
    if (appliedFilters.month) {
      const monthIndex = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ].indexOf(appliedFilters.month);
      
      if (monthIndex !== -1) {
        daysInPeriod = new Date(appliedFilters.year, monthIndex + 1, 0).getDate();
      }
    }
    
    // Calcular tasa de ocupación (noches reservadas / días disponibles)
    const occupancyRate = (totalNights / daysInPeriod) * 100;
    
    // Calcular estancia promedio
    const averageStay = totalBookings > 0 ? totalNights / totalBookings : 0;

    return {
      name: decodedApartmentName,
      bookings: totalBookings,
      totalRevenue: totalRevenue,
      averageNightlyRate: averageNightlyRate,
      occupancyRate: Math.min(occupancyRate, 100), // No permitir ocupación > 100%
      totalNights: totalNights,
      averageStay: averageStay
    };
  };

  const apartmentSummary = calculateApartmentSummary(filteredBookings);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-xl">Cargando datos del apartamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-xl text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-rental-primary text-white rounded hover:bg-rental-primary/90"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFilters={true}>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={dashboardPath}>
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <span>Apartamentos</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-medium">{decodedApartmentName}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rental-dark">
          {decodedApartmentName}
        </h1>
        <p className="text-gray-500">Información detallada y rendimiento del apartamento</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ApartmentStats summary={apartmentSummary} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <BookingList bookings={filteredBookings} apartmentName={decodedApartmentName} />
      </div>
    </MainLayout>
  );
};

export default ApartmentDetail;
