import React from 'react';
import { cn } from '@/lib/utils';

interface GreenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const GreenButton: React.FC<GreenButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transform hover:scale-105',
    secondary: 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-200',
    outline: 'border border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700',
    ghost: 'text-green-600 hover:bg-green-50 hover:text-green-700'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && 'animate-pulse',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Đang xử lý...
        </div>
      ) : (
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
};

// Button variants với animation đặc biệt
export const AnimatedGreenButton: React.FC<GreenButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <GreenButton
      variant={variant}
      size={size}
      className={cn(
        'animate-pulse-green hover:animate-none',
        className
      )}
      {...props}
    >
      {children}
    </GreenButton>
  );
};

// Button với hiệu ứng wave
export const WaveGreenButton: React.FC<GreenButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <GreenButton
      variant={variant}
      size={size}
      className={cn(
        'relative overflow-hidden group',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </GreenButton>
  );
};
