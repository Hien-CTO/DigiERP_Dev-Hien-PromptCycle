import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface GreenAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  animated?: boolean;
}

export const GreenAlert: React.FC<GreenAlertProps> = ({
  variant = 'success',
  title,
  children,
  dismissible = false,
  onDismiss,
  animated = false,
  className,
  ...props
}) => {
  const baseClasses = 'p-4 rounded-lg border transition-all duration-200';
  
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    info: Info
  };
  
  const iconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };
  
  const Icon = icons[variant];
  const animationClasses = animated ? 'animate-fade-in' : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        animationClasses,
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColors[variant])} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
                variant === 'success' && 'text-green-500 hover:bg-green-100 focus:ring-green-500',
                variant === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500',
                variant === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-500',
                variant === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-500'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Alert với hiệu ứng slide-in
export const SlideInGreenAlert: React.FC<GreenAlertProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <GreenAlert
      className={cn('animate-slide-in', className)}
      {...props}
    >
      {children}
    </GreenAlert>
  );
};

// Alert với hiệu ứng bounce
export const BounceGreenAlert: React.FC<GreenAlertProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <GreenAlert
      className={cn('animate-bounce-gentle', className)}
      {...props}
    >
      {children}
    </GreenAlert>
  );
};

// Alert với wave background
export const WaveGreenAlert: React.FC<GreenAlertProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 wave-bg opacity-20"></div>
      <GreenAlert
        className={cn('relative z-10 bg-transparent border-0', className)}
        {...props}
      >
        {children}
      </GreenAlert>
    </div>
  );
};

// Toast Alert - compact version
interface GreenToastProps {
  message: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const GreenToast: React.FC<GreenToastProps> = ({
  message,
  variant = 'success',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm w-full',
      'transform transition-all duration-300',
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <GreenAlert
        variant={variant}
        dismissible
        onDismiss={() => {
          setIsVisible(false);
          if (onClose) {
            setTimeout(onClose, 300);
          }
        }}
        className="shadow-lg"
      >
        {message}
      </GreenAlert>
    </div>
  );
};
