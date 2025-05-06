import React from 'react';
import { ApartmentList } from '@/components/dashboard/ApartmentList';
import { BookingSourceChart } from '@/components/dashboard/BookingSourceChart';

// Definición actualizada para adaptarse a los datos que recibimos
interface ApartmentSummary {
  apartment: string;
  bookings: number;
  revenue: number;
  profit: number;
  nights: number;
  profitability: number;
  revenuePerNight: number;
  profitPerNight: number;
}

interface BookingSource {
  name: string;
  value: number;
}

interface DashboardDataProps {
  apartments: ApartmentSummary[];
  sources: BookingSource[];
}

export const DashboardData: React.FC<DashboardDataProps> = ({
  apartments,
  sources
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <ApartmentList apartments={apartments} />
      </div>
      <div>
        <BookingSourceChart sources={sources} />
      </div>
    </div>
  );
};
