import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface GreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  animated?: boolean;
}

export const GreenModal: React.FC<GreenModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  animated = true
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black bg-opacity-50 backdrop-blur-sm',
        'transition-all duration-300',
        animated && (isVisible ? 'opacity-100' : 'opacity-0')
      )}
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl w-full',
          sizes[size],
          'transform transition-all duration-300',
          animated && (isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0')
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-green-200 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-green-200 bg-green-50/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal
interface GreenConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

export const GreenConfirmModal: React.FC<GreenConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'warning',
  loading = false
}) => {
  const variants = {
    success: {
      icon: '✓',
      iconColor: 'text-green-600',
      confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    warning: {
      icon: '⚠',
      iconColor: 'text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    error: {
      icon: '✕',
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    },
    info: {
      icon: 'ℹ',
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };
  
  const config = variants[variant];
  
  return (
    <GreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50',
              config.confirmButton
            )}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang xử lý...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <div className="flex items-start space-x-3">
        <div className={cn('text-2xl', config.iconColor)}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </GreenModal>
  );
};

// Loading Modal
interface GreenLoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export const GreenLoadingModal: React.FC<GreenLoadingModalProps> = ({
  isOpen,
  title = 'Đang xử lý...',
  message = 'Vui lòng chờ trong giây lát'
}) => {
  return (
    <GreenModal
      isOpen={isOpen}
      onClose={() => {}}
      title={title}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="text-center py-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </GreenModal>
  );
};
