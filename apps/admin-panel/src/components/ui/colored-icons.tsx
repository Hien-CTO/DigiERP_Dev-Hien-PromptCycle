import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Building2, 
  FileText, 
  Users, 
  Shield,
  BarChart3,
  DollarSign,
  TrendingUp,
  Settings,
  Home,
  Key,
  Cog,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';

// Định nghĩa các màu sắc cho icon
export const iconColors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500', 
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  lime: 'bg-lime-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  violet: 'bg-violet-500',
  sky: 'bg-sky-500',
  slate: 'bg-slate-500',
  gray: 'bg-gray-500',
  zinc: 'bg-zinc-500',
  neutral: 'bg-neutral-500',
  stone: 'bg-stone-500'
} as const;

export type IconColor = keyof typeof iconColors;

// Định nghĩa các icon phổ biến
export const commonIcons = {
  Package,
  ShoppingCart,
  Warehouse,
  Building2,
  FileText,
  Users,
  Shield,
  BarChart3,
  DollarSign,
  TrendingUp,
  Settings,
  Home,
  Key,
  Cog,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Eye,
  EyeOff,
  Search
} as const;

export type IconName = keyof typeof commonIcons;

interface ColoredIconProps {
  icon: IconName;
  color: IconColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'outline' | 'gradient';
}

export const ColoredIcon: React.FC<ColoredIconProps> = ({
  icon,
  color,
  size = 'md',
  className,
  variant = 'default'
}) => {
  const IconComponent = commonIcons[icon];
  
  const sizeClasses = {
    sm: 'p-2 h-8 w-8',
    md: 'p-3 h-12 w-12', 
    lg: 'p-4 h-16 w-16',
    xl: 'p-6 h-20 w-20'
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8', 
    xl: 'h-10 w-10'
  };
  
  const variants = {
    default: `${iconColors[color]} text-white`,
    outline: `border-2 border-${color}-500 text-${color}-500 bg-transparent`,
    gradient: `bg-gradient-to-br from-${color}-400 to-${color}-600 text-white`
  };
  
  return (
    <div className={cn(
      'rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105',
      sizeClasses[size],
      variants[variant],
      className
    )}>
      <IconComponent className={iconSizeClasses[size]} />
    </div>
  );
};

// Component cho icon với text
interface IconWithTextProps {
  icon: IconName;
  color: IconColor;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IconWithText: React.FC<IconWithTextProps> = ({
  icon,
  color,
  title,
  description,
  size = 'md',
  className
}) => {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <ColoredIcon icon={icon} color={color} size={size} />
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
};

// Component cho stats với icon
interface StatsWithIconProps {
  icon: IconName;
  color: IconColor;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsWithIcon: React.FC<StatsWithIconProps> = ({
  icon,
  color,
  title,
  value,
  trend,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
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
      <ColoredIcon icon={icon} color={color} size="md" />
    </div>
  );
};

// Predefined icon sets cho các module
export const moduleIcons = {
  products: { icon: 'Package' as IconName, color: 'blue' as IconColor },
  sales: { icon: 'ShoppingCart' as IconName, color: 'green' as IconColor },
  inventory: { icon: 'Warehouse' as IconName, color: 'orange' as IconColor },
  purchase: { icon: 'Building2' as IconName, color: 'purple' as IconColor },
  financial: { icon: 'FileText' as IconName, color: 'red' as IconColor },
  users: { icon: 'Users' as IconName, color: 'indigo' as IconColor },
  reports: { icon: 'BarChart3' as IconName, color: 'emerald' as IconColor },
  settings: { icon: 'Settings' as IconName, color: 'gray' as IconColor }
} as const;

// Helper function để lấy icon cho module
export const getModuleIcon = (module: keyof typeof moduleIcons) => {
  return moduleIcons[module];
};
