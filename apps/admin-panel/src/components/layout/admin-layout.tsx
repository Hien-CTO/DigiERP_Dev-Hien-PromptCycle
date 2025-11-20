'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  User,
  Key,
  Package,
  ShoppingCart,
  Warehouse,
  FileText,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  Cog,
  DollarSign,
  Database,
  Truck,
  FolderTree,
  Briefcase,
  MapPin
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { toast } from 'react-hot-toast';
import { canAccessNavigation } from '@/lib/permissions';
import { useMemo } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Hồ sơ cá nhân', href: '/admin/profile', icon: User },
  
  // Product Management
  { 
    name: 'Quản lý sản phẩm', 
    icon: Package,
    children: [
      { name: 'Quản lý sản phẩm', href: '/admin/products', icon: Package },
      { name: 'Cài đặt sản phẩm', href: '/admin/products/settings', icon: Settings },
      { name: 'Giá sản phẩm', href: '/admin/products/pricing', icon: DollarSign },
    ]
  },
  
  // Sales Management
  { 
    name: 'Bán hàng', 
    icon: ShoppingCart,
    children: [
      { name: 'Đơn hàng', href: '/admin/sales/orders', icon: ShoppingCart },
      { name: 'Khách hàng', href: '/admin/sales/customers', icon: Users },
    ]
  },
  
  // Purchase Management
  { 
    name: 'Mua hàng', 
    icon: Building2,
    children: [
      { name: 'Đơn Yêu Cầu', href: '/admin/purchase/requests', icon: FileText },
      { name: 'Đơn hàng mua', href: '/admin/purchase/orders', icon: ShoppingCart },
      { name: 'Nhà cung cấp', href: '/admin/purchase/suppliers', icon: Truck },
    ]
  },
  
  // Inventory Management
  { 
    name: 'Kho hàng', 
    icon: Warehouse,
    children: [
      { name: 'Tồn kho', href: '/admin/inventory/stock', icon: Package },
      { name: 'Nhập kho', href: '/admin/inventory/goods-receipt', icon: Package },
    ]
  },
  
  // Financial Management
  { 
    name: 'Tài Chính', 
    icon: DollarSign,
    children: [
      { name: 'Hóa đơn', href: '/admin/financial/invoices', icon: FileText },
    ]
  },
  
  // HR Management
  {
    name: 'Quản lý nhân sự', 
    icon: Users,
    children: [
      { name: 'Nhân viên', href: '/admin/hr/employees', icon: Users },
      { name: 'Chấm công', href: '/admin/hr/attendance', icon: FileText },
      { name: 'Nghỉ phép', href: '/admin/hr/leave', icon: FileText },
    ]
  },
  
  // System Management
  { 
    name: 'Quản lý hệ thống', 
    icon: Settings,
    children: [
      { name: 'Người dùng', href: '/admin/users', icon: Users },
      // { name: 'Vai trò', href: '/admin/roles', icon: Shield },
      { name: 'Phân quyền hệ thống', href: '/admin/system/catalog', icon: Shield },
      { name: 'Danh mục Hệ Thống', href: '/admin/system/catalogs', icon: Database },
      { name: 'Cài đặt', href: '/admin/settings', icon: Cog },
    ]
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { currentTenant, setCurrentTenant } = useTenantStore();

  // Initialize tenant khi user đăng nhập
  useEffect(() => {
    if (user && !currentTenant) {
      // Set primary tenant hoặc tenant đầu tiên làm mặc định
      const defaultTenant = user.tenant
        ? { ...user.tenant, isPrimary: true }
        : user.tenants?.[0] || null;
      
      if (defaultTenant) {
        setCurrentTenant(defaultTenant);
      }
    }
  }, [user, currentTenant, setCurrentTenant]);

  // Lấy danh sách tenants từ user profile (chỉ những tenant mà user có quyền)
  // Không fetch từ API - chỉ sử dụng tenants từ user profile đã được load từ /api/auth/me
  const availableTenants = useMemo(() => {
    if (!user) return [];
    // Ưu tiên sử dụng user.tenants (danh sách đầy đủ các tenants mà user thuộc về)
    if (user.tenants && user.tenants.length > 0) {
      return user.tenants;
    }
    // Fallback: nếu không có user.tenants, sử dụng user.tenant (primary tenant)
    if (user.tenant) {
      return [{ ...user.tenant, isPrimary: true }];
    }
    return [];
  }, [user]);

  // Filter navigation items based on user permissions
  const filteredNavigation = useMemo(() => {
    if (!user?.permissions) {
      console.log('⚠️ No permissions found, showing all navigation items');
      return navigation;
    }
    
    console.log('🔐 User permissions:', user.permissions);
    console.log('🔐 User roles:', user.roles);
    
    const filtered = navigation.filter(item => {
      // Always show Home
      if (item.href === '/admin') return true;
      
      // Check main item permission
      if (item.children) {
        // For parent items with children, show if any child is accessible
        const hasAccessibleChild = item.children.some(child => {
          const canAccess = canAccessNavigation(user.permissions, child.href);
          console.log(`🔍 Checking ${child.href}: ${canAccess ? '✅' : '❌'}`);
          return canAccess;
        });
        
        // Special debug for Purchase menu
        if (item.name === 'Mua hàng') {
          console.log(`🛒 [Purchase Menu Debug] Menu: ${item.name}`);
          console.log(`🛒 [Purchase Menu Debug] Children:`, item.children.map(c => c.href));
          console.log(`🛒 [Purchase Menu Debug] Has accessible child: ${hasAccessibleChild}`);
          item.children.forEach(child => {
            const canAccess = canAccessNavigation(user.permissions, child.href);
            console.log(`🛒 [Purchase Menu Debug] - ${child.name} (${child.href}): ${canAccess ? '✅' : '❌'}`);
          });
        }
        
        return hasAccessibleChild;
      }
      
      // Check single item permission
      const canAccess = canAccessNavigation(user.permissions, item.href);
      console.log(`🔍 Checking ${item.href}: ${canAccess ? '✅' : '❌'}`);
      return canAccess;
    }).map(item => {
      // Filter children based on permissions
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => {
            const canAccess = canAccessNavigation(user?.permissions || [], child.href);
            if (!canAccess) {
              console.log(`🚫 Filtered out child: ${child.href}`);
            }
            return canAccess;
          })
        };
      }
      return item;
    }).filter(item => {
      // Remove parent items that have no accessible children
      if (item.children && item.children.length === 0) {
        console.log(`🚫 Removed parent item with no accessible children: ${item.name}`);
        return false;
      }
      return true;
    });
    
    console.log('📋 Filtered navigation:', filtered);
    return filtered;
  }, [user?.permissions]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    router.push('/login');
  };

  const renderMenuItem = (item: any, isCollapsed: boolean = false) => {
    const Icon = item.icon;
    const isExpanded = expandedMenus.includes(item.name);
    
    if (item.children) {
      return (
        <div className="relative group/item">
          <button
            onClick={() => !isCollapsed && toggleMenu(item.name)}
            className="menu-item flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-800 group"
            title={isCollapsed ? item.name : ''}
          >
            <div className="flex items-center min-w-0">
              <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-green-600 group-hover:text-green-700 transition-colors duration-200 flex-shrink-0`} />
              <span className={`${isCollapsed ? 'hidden group-hover/sidebar:inline-block' : 'block'} truncate whitespace-nowrap`}>{item.name}</span>
            </div>
            <div className={`${isCollapsed ? 'hidden group-hover/sidebar:block' : 'block'} transition-transform duration-200 group-hover:scale-110 flex-shrink-0`}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-green-600" />
              )}
            </div>
          </button>
          {isExpanded && (
            <div className={`ml-6 space-y-1 animate-fade-in ${isCollapsed ? 'hidden group-hover/sidebar:block' : 'block'}`}>
              {item.children.map((child: any) => {
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    className="menu-item flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-700 group"
                  >
                    <ChildIcon className="mr-3 h-4 w-4 text-green-500 group-hover:text-green-600 transition-colors duration-200" />
                    <span className="whitespace-nowrap">{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
          {/* Tooltip menu khi collapsed */}
          {isCollapsed && (
            <div className="absolute left-full top-0 ml-2 hidden group-hover/item:block z-50">
              <div className="bg-white rounded-lg shadow-xl border border-green-200 py-2 min-w-[200px]">
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                  {item.name}
                </div>
                {item.children.map((child: any) => {
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
                    >
                      <ChildIcon className="mr-3 h-4 w-4 text-green-500" />
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <Link
        href={item.href}
        className="menu-item flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-800 group"
        title={isCollapsed ? item.name : ''}
      >
        <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-green-600 group-hover:text-green-700 transition-colors duration-200 flex-shrink-0`} />
        <span className={`${isCollapsed ? 'hidden group-hover/sidebar:inline-block' : 'block'} truncate whitespace-nowrap`}>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-green-500 to-green-600">
            <h1 className="text-xl font-bold text-white">DigiERP</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-green-600"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 bg-white">
            {filteredNavigation.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out group/sidebar z-40 ${
          sidebarCollapsed ? 'lg:w-20 hover:lg:w-64' : 'lg:w-64'
        }`}
      >
        <div className="flex flex-col flex-grow bg-white border-r border-green-200 shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-green-500 to-green-600">
            <h1 className={`text-xl font-bold text-white transition-opacity duration-200 ${
              sidebarCollapsed ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
            }`}>
              DigiERP
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 bg-white overflow-y-auto">
            {filteredNavigation.map((item) => (
              <div key={item.name} className={sidebarCollapsed ? 'group-hover/sidebar:block' : ''}>
                {renderMenuItem(item, sidebarCollapsed)}
              </div>
            ))}
          </nav>
          
          {/* Toggle button */}
          <div className="p-3 border-t border-green-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-800 transition-colors duration-200"
              title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              <ChevronRight className={`h-5 w-5 text-green-600 transition-transform duration-300 ${
                sidebarCollapsed ? 'rotate-0' : 'rotate-180'
              }`} />
              <span className={`ml-2 transition-opacity duration-200 ${
                sidebarCollapsed ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
              }`}>
                {sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Top bar với wave header */}
        <div className="sticky top-0 z-40">
          {/* Top bar content */}
          <div className="flex h-16 shrink-0 items-center gap-x-4 border-b border-green-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-green-600 hover:bg-green-50"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1" />
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Tenant Selector */}
                {availableTenants.length > 0 && (
                  <div className="hidden lg:block">
                    <Select
                      value={currentTenant?.tenantId?.toString() || ''}
                      onValueChange={(value) => {
                        const selectedTenant = availableTenants.find(
                          t => t.tenantId.toString() === value
                        );
                        if (selectedTenant) {
                          setCurrentTenant(selectedTenant);
                          toast.success(`Đã chuyển sang tenant: ${selectedTenant.tenantName}`);
                          // Invalidate tất cả queries để refresh data với tenant mới
                          if (typeof window !== 'undefined') {
                            // Reload page để refresh toàn bộ data
                            window.location.reload();
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-[220px] bg-white border-green-200 hover:border-green-300">
                        <div className="flex items-center gap-2 w-full">
                          <Building2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <SelectValue placeholder="Chọn tenant">
                            {currentTenant ? (
                              <span className="truncate font-medium">{currentTenant.tenantName}</span>
                            ) : (
                              <span className="text-gray-500">Chọn tenant</span>
                            )}
                          </SelectValue>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableTenants.map((tenant) => (
                          <SelectItem key={tenant.tenantId} value={tenant.tenantId.toString()}>
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="truncate">{tenant.tenantName}</span>
                              {tenant.isPrimary && (
                                <Badge className="ml-2 bg-blue-500 text-white text-xs flex-shrink-0">Primary</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User menu with dropdown */}
                <div className="relative group/user">
                  <div className="flex items-center gap-x-3 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-green-600">
                        {currentTenant?.tenantName || user?.tenant?.tenantName || user?.tenants?.[0]?.tenantName || user?.roles?.join(', ')}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                  </div>
                  
                  {/* Dropdown menu on hover */}
                  <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-lg shadow-xl border border-green-200 py-2">
                      <Link
                        href="/admin/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User className="mr-3 h-4 w-4 text-green-500" />
                        Hồ sơ cá nhân
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
