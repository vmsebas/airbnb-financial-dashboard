import React from 'react';
import { DashboardSkeleton } from './SkeletonLoaders';

interface DashboardLoadingStateProps {
  message?: string;
}

export const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({ 
  message = "Obteniendo información financiera actualizada" 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-rental-dark dark:text-white">Cargando datos...</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
      
      <DashboardSkeleton />
    </div>
  );
};
