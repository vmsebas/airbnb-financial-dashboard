import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Esqueleto para tarjetas de estadísticas
export const StatCardSkeleton: React.FC = () => {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Esqueleto para métricas básicas
export const BasicMetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
};

// Esqueleto para métricas avanzadas
export const AdvancedMetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
};

// Esqueleto para gráficos
export const ChartSkeleton: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-72 sm:h-80 w-full p-2 sm:p-4">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

// Esqueleto para gráficos de dashboard
export const DashboardChartsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
};

// Esqueleto para el dashboard completo
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      
      <BasicMetricsSkeleton />
      <AdvancedMetricsSkeleton />
      <DashboardChartsSkeleton />
    </div>
  );
};

// Esqueleto para tarjetas comparativas
export const ComparativeMetricCardSkeleton: React.FC = () => {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-3 w-48 mb-4" />
        
        <div className="mt-2">
          <Skeleton className="h-8 w-36 mb-2" />
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Esqueleto para métricas comparativas
export const ComparativeMetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ComparativeMetricCardSkeleton />
      <ComparativeMetricCardSkeleton />
      <ComparativeMetricCardSkeleton />
    </div>
  );
};
