import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

interface GreenInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  onClear?: () => void;
}

export const GreenInput: React.FC<GreenInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  clearable = false,
  onClear,
  className,
  ...props
}) => {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1';
  
  const variants = {
    default: 'border-green-200 bg-white hover:border-green-300 focus:border-green-500',
    filled: 'border-green-200 bg-green-50 hover:bg-green-100 focus:bg-white focus:border-green-500',
    outlined: 'border-green-300 bg-transparent hover:border-green-400 focus:border-green-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-green-500">{leftIcon}</span>
          </div>
        )}
        
        <input
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            errorClasses,
            leftIcon && 'pl-10',
            (rightIcon || clearable) && 'pr-10',
            className
          )}
          {...props}
        />
        
        {(rightIcon || clearable) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {clearable && props.value && (
              <button
                type="button"
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {rightIcon && (
              <span className="text-green-500 ml-2">{rightIcon}</span>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// Password Input với toggle visibility
interface GreenPasswordInputProps extends Omit<GreenInputProps, 'type' | 'rightIcon'> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const GreenPasswordInput: React.FC<GreenPasswordInputProps> = ({
  showPassword = false,
  onTogglePassword,
  ...props
}) => {
  return (
    <GreenInput
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={onTogglePassword}
          className="text-green-500 hover:text-green-700 transition-colors duration-200"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
};

// Search Input
interface GreenSearchInputProps extends Omit<GreenInputProps, 'leftIcon' | 'clearable'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

export const GreenSearchInput: React.FC<GreenSearchInputProps> = ({
  onSearch,
  onClear,
  ...props
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };
  
  return (
    <GreenInput
      leftIcon={<Search className="h-4 w-4" />}
      clearable
      onClear={onClear}
      onKeyPress={handleKeyPress}
      placeholder="Tìm kiếm..."
      {...props}
    />
  );
};

// Textarea
interface GreenTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const GreenTextarea: React.FC<GreenTextareaProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  resize = 'vertical',
  className,
  ...props
}) => {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1';
  
  const variants = {
    default: 'border-green-200 bg-white hover:border-green-300 focus:border-green-500',
    filled: 'border-green-200 bg-green-50 hover:bg-green-100 focus:bg-white focus:border-green-500',
    outlined: 'border-green-300 bg-transparent hover:border-green-400 focus:border-green-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          resizeClasses[resize],
          errorClasses,
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
