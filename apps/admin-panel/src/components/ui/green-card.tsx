import React from 'react';
import { cn } from '@/lib/utils';

interface GreenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
}

export const GreenCard: React.FC<GreenCardProps> = ({
  variant = 'default',
  children,
  header,
  footer,
  hover = true,
  className,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border transition-all duration-200';
  
  const variants = {
    default: 'border-green-200 shadow-sm',
    elevated: 'border-green-200 shadow-md hover:shadow-lg',
    outlined: 'border-green-300 shadow-none',
    gradient: 'border-green-200 shadow-sm bg-gradient-to-br from-green-50 to-white'
  };
  
  const hoverClasses = hover ? 'hover:shadow-md hover:border-green-300 hover:-translate-y-1' : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {header && (
        <div className="card-green-header">
          {header}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-green-200 bg-green-50/50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

// Card với animation fade-in
export const AnimatedGreenCard: React.FC<GreenCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <GreenCard
      className={cn('animate-fade-in', className)}
      {...props}
    >
      {children}
    </GreenCard>
  );
};

// Card với hiệu ứng wave background
export const WaveGreenCard: React.FC<GreenCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 wave-bg opacity-10"></div>
      <GreenCard
        className={cn('relative z-10', className)}
        {...props}
      >
        {children}
      </GreenCard>
    </div>
  );
};

// Card stats với icon và số liệu
interface GreenStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const GreenStatsCard: React.FC<GreenStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <GreenCard
      variant="elevated"
      className={cn('p-6', className)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm flex items-center mt-1',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="mr-1">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-green-100 rounded-full text-green-600">
          {icon}
        </div>
      </div>
    </GreenCard>
  );
};
