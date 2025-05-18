import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive: boolean;
  };
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  tooltip 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block ml-1">
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-64 text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h3>
            <div className={`ml-auto p-1.5 rounded-full ${isDarkMode ? 'bg-primary/20' : 'bg-muted'} text-primary`}>
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <h4 className="text-xl sm:text-2xl font-semibold text-foreground">{value}</h4>
            {trend !== null && trend !== undefined && (
              <span className={`text-xs font-medium ${
                trend.isPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
