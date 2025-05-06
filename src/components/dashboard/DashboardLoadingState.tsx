import React from 'react';
import { DashboardSkeleton } from './SkeletonLoaders';

export const DashboardLoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-rental-dark dark:text-white">Cargando datos...</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo información financiera actualizada
          </p>
        </div>
      </div>
      
      <DashboardSkeleton />
    </div>
  );
};
