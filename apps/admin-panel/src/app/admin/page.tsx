'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GreenCard, GreenStatsCard, GreenButton, GreenBadge, GreenAlert } from '@/components/ui';
import { ColoredIcon, StatsWithIcon, getModuleIcon } from '@/components/ui/colored-icons';
import { 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Building2, 
  FileText, 
  Users, 
  Shield,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const serviceModules = [
  {
    title: 'Quản lý sản phẩm',
    description: 'Quản lý danh mục sản phẩm, giá cả, tồn kho',
    icon: Package,
    href: '/admin/products',
    color: 'bg-blue-500',
  },
  {
    title: 'Bán hàng',
    description: 'Quản lý đơn hàng, khách hàng, báo cáo doanh thu',
    icon: ShoppingCart,
    href: '/admin/sales/orders',
    color: 'bg-green-500',
  },
  {
    title: 'Quản lý kho',
    description: 'Quản lý kho hàng, nhập xuất, kiểm kê',
    icon: Warehouse,
    href: '/admin/inventory/stock',
    color: 'bg-orange-500',
  },
  {
    title: 'Mua hàng',
    description: 'Quản lý đơn mua, nhà cung cấp, hợp đồng',
    icon: Building2,
    href: '/admin/purchase/orders',
    color: 'bg-purple-500',
  },
  {
    title: 'Tài chính',
    description: 'Quản lý hóa đơn, thanh toán, báo cáo tài chính',
    icon: FileText,
    href: '/admin/financial/invoices',
    color: 'bg-red-500',
  },
  {
    title: 'Quản lý người dùng',
    description: 'Quản lý tài khoản, vai trò, phân quyền',
    icon: Users,
    href: '/admin/users',
    color: 'bg-indigo-500',
  },
  {
    title: 'Quản lý nhân sự',
    description: 'Quản lý nhân viên, phòng ban, chấm công, nghỉ phép',
    icon: Users,
    href: '/admin/hr/employees',
    color: 'bg-pink-500',
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
        <p className="text-gray-600">Chọn module để quản lý</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GreenCard variant="elevated">
          <StatsWithIcon
            icon="Package"
            color="blue"
            title="Tổng sản phẩm"
            value="1,234"
            trend={{ value: 12, isPositive: true }}
          />
        </GreenCard>

        <GreenCard variant="elevated">
          <StatsWithIcon
            icon="ShoppingCart"
            color="green"
            title="Đơn hàng hôm nay"
            value="56"
            trend={{ value: 8, isPositive: true }}
          />
        </GreenCard>

        <GreenCard variant="elevated">
          <StatsWithIcon
            icon="Warehouse"
            color="orange"
            title="Tồn kho"
            value="89%"
            trend={{ value: 5, isPositive: true }}
          />
        </GreenCard>

        <GreenCard variant="elevated">
          <StatsWithIcon
            icon="BarChart3"
            color="emerald"
            title="Doanh thu tháng"
            value="₫2.4M"
            trend={{ value: 15, isPositive: true }}
          />
        </GreenCard>
      </div>

      {/* Service Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Các module quản lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <GreenCard key={module.href} variant="elevated">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                <Link href={module.href}>
                  <GreenButton className="w-full" variant="outline">
                    Truy cập
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </GreenButton>
                </Link>
              </GreenCard>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <GreenCard variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thao tác nhanh</h3>
          <p className="text-gray-600 text-sm mb-4">Các thao tác thường dùng</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/sales/orders/new">
              <GreenButton variant="outline" className="w-full">
                Tạo đơn hàng mới
              </GreenButton>
            </Link>
            <Link href="/admin/inventory/goods-receipt">
              <GreenButton variant="outline" className="w-full">
                Nhập kho
              </GreenButton>
            </Link>
            <Link href="/admin/purchase/orders">
              <GreenButton variant="outline" className="w-full">
                Đặt hàng
              </GreenButton>
            </Link>
            <Link href="/admin/financial/invoices">
              <GreenButton variant="outline" className="w-full">
                Tạo hóa đơn
              </GreenButton>
            </Link>
          </div>
        </div>
      </GreenCard>
    </div>
  );
}