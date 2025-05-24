
import React from 'react';

interface DashboardErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <p className="text-xl text-red-500">{error}</p>
        {onRetry && (
          <button 
            className="mt-4 px-4 py-2 bg-rental-primary text-white rounded hover:bg-rental-primary/90"
            onClick={onRetry}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
