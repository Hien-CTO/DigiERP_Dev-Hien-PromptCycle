import React from 'react';
import { cn } from '@/lib/utils';

interface GreenBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  animated?: boolean;
}

export const GreenBadge: React.FC<GreenBadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  dot = false,
  animated = false,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200';
  
  const variants = {
    default: 'bg-green-100 text-green-800 border border-green-200',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    outline: 'bg-transparent text-green-600 border border-green-300'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  
  const animationClasses = animated ? 'animate-pulse-green' : '';
  
  return (
    <span
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        animationClasses,
        className
      )}
      {...props}
    >
      {dot && (
        <div className={cn(
          'w-2 h-2 rounded-full mr-1.5',
          variant === 'default' && 'bg-green-500',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'error' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'outline' && 'bg-green-500'
        )} />
      )}
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

// Badge với hiệu ứng bounce
export const BounceGreenBadge: React.FC<GreenBadgeProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <GreenBadge
      className={cn('animate-bounce-gentle', className)}
      {...props}
    >
      {children}
    </GreenBadge>
  );
};

// Badge với hiệu ứng wave
export const WaveGreenBadge: React.FC<GreenBadgeProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <GreenBadge
      className={cn('animate-wave', className)}
      {...props}
    >
      {children}
    </GreenBadge>
  );
};

// Badge status cho các trạng thái
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  animated = false
}) => {
  const statusConfig = {
    active: {
      variant: 'success' as const,
      text: 'Hoạt động',
      icon: '●'
    },
    inactive: {
      variant: 'error' as const,
      text: 'Không hoạt động',
      icon: '●'
    },
    pending: {
      variant: 'warning' as const,
      text: 'Đang chờ',
      icon: '⏳'
    },
    completed: {
      variant: 'success' as const,
      text: 'Hoàn thành',
      icon: '✓'
    },
    cancelled: {
      variant: 'error' as const,
      text: 'Đã hủy',
      icon: '✕'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <GreenBadge
      variant={config.variant}
      size={size}
      icon={config.icon}
      animated={animated}
    >
      {config.text}
    </GreenBadge>
  );
};
