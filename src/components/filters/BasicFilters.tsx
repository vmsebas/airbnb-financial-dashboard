import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFilters } from '@/context/FilterContext';
import { MultiSelect } from '@/components/ui/multi-select';

interface BasicFiltersProps {
  apartments: string[];
  loading: boolean;
  yearOptions: number[];
  isDetailView?: boolean;
  currentApartment?: string | null;
}

const monthOptions = [
  { value: 'Enero', label: 'Enero' },
  { value: 'Febrero', label: 'Febrero' },
  { value: 'Marzo', label: 'Marzo' },
  { value: 'Abril', label: 'Abril' },
  { value: 'Mayo', label: 'Mayo' },
  { value: 'Junio', label: 'Junio' },
  { value: 'Julio', label: 'Julio' },
  { value: 'Agosto', label: 'Agosto' },
  { value: 'Septiembre', label: 'Septiembre' },
  { value: 'Octubre', label: 'Octubre' },
  { value: 'Noviembre', label: 'Noviembre' },
  { value: 'Diciembre', label: 'Diciembre' },
];

const bookingSourceOptions = [
  { value: 'Airbnb', label: 'Airbnb' },
  { value: 'Booking.com', label: 'Booking.com' },
  { value: 'Vrbo', label: 'Vrbo' },
  { value: 'Directo', label: 'Directo' },
];

const paymentStatusOptions = [
  { value: 'true', label: 'Pagado' },
  { value: 'false', label: 'No pagado' },
];

export const BasicFilters: React.FC<BasicFiltersProps> = ({ 
  apartments, 
  loading, 
  yearOptions,
  isDetailView = false,
  currentApartment = null
}) => {
  const { filters, setFilters } = useFilters();

  const handleMonthChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      month: value === 'all' ? null : value
    }));
  };

  const handleApartmentsChange = (selectedApartments: string[]) => {
    setFilters(prev => ({
      ...prev,
      apartment: selectedApartments.length > 0 ? selectedApartments : null
    }));
  };

  const handleBookingSourceChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      bookingSource: value === 'all' ? null : value
    }));
  };

  const handlePaymentStatusChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      paymentStatus: value === 'all' 
        ? null 
        : value === 'true' 
          ? true 
          : false
    }));
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    setFilters(prev => ({
      ...prev,
      year
    }));
  };

  const apartmentOptions = apartments.map(apartment => ({
    value: apartment,
    label: apartment
  }));

  const selectedApartments = filters.apartment || [];

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-end flex-wrap">
      <div className="w-full md:w-auto">
        <Label htmlFor="year-filter">Año</Label>
        <Select 
          value={String(filters.year)} 
          onValueChange={handleYearChange}
          disabled={loading}
        >
          <SelectTrigger id="year-filter" className="w-full md:w-[100px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-auto">
        <Label htmlFor="month-filter">Mes</Label>
        <Select 
          value={filters.month || 'all'} 
          onValueChange={handleMonthChange}
          disabled={loading}
        >
          <SelectTrigger id="month-filter" className="w-full md:w-[150px]">
            <SelectValue placeholder="Todos los meses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-months" value="all">Todos los meses</SelectItem>
            {monthOptions.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isDetailView && (
        <div className="w-full md:w-auto">
          <Label htmlFor="apartment-filter">Apartamento</Label>
          <MultiSelect
            options={apartmentOptions}
            selected={Array.isArray(selectedApartments) ? selectedApartments : []}
            onChange={handleApartmentsChange}
            placeholder="Todos los apartamentos"
            className="w-full md:w-[280px]"
            emptyText="No hay apartamentos disponibles"
          />
        </div>
      )}

      <div className="w-full md:w-auto">
        <Label htmlFor="source-filter">Portal de Reserva</Label>
        <Select
          value={filters.bookingSource || 'all'}
          onValueChange={handleBookingSourceChange}
        >
          <SelectTrigger id="source-filter" className="w-full md:w-[180px]">
            <SelectValue placeholder="Todos los portales" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-sources" value="all">Todos los portales</SelectItem>
            {bookingSourceOptions.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-auto">
        <Label htmlFor="payment-filter">Estado de Pago</Label>
        <Select
          value={filters.paymentStatus !== null ? String(filters.paymentStatus) : 'all'}
          onValueChange={handlePaymentStatusChange}
        >
          <SelectTrigger id="payment-filter" className="w-full md:w-[150px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-payment" value="all">Todos</SelectItem>
            {paymentStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
