'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GreenCard, GreenButton } from '@/components/ui';
import { 
  Building2, 
  Briefcase,
  Warehouse,
  Package,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const catalogModules = [
  {
    title: 'Danh mục Phòng Ban',
    description: 'Quản lý thông tin các phòng ban trong công ty',
    icon: Building2,
    href: '/admin/system/catalogs/departments',
    color: 'bg-blue-500',
  },
  {
    title: 'Danh mục Chức Vụ',
    description: 'Quản lý các chức vụ và vị trí công việc',
    icon: Briefcase,
    href: '/admin/system/catalogs/positions',
    color: 'bg-purple-500',
  },
  {
    title: 'Danh mục Kho',
    description: 'Quản lý thông tin các kho hàng trong hệ thống',
    icon: Warehouse,
    href: '/admin/system/catalogs/warehouses',
    color: 'bg-orange-500',
  },
  {
    title: 'Danh mục Loại Sản Phẩm',
    description: 'Quản lý các danh mục sản phẩm trong hệ thống',
    icon: Package,
    href: '/admin/system/catalogs/product-categories',
    color: 'bg-green-500',
  },
];

export default function CatalogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Danh mục Hệ Thống</h1>
        <p className="mt-2 text-gray-600">
          Quản lý các danh mục hệ thống: Phòng ban, Chức vụ, Kho hàng, Loại sản phẩm
        </p>
      </div>

      {/* Catalog Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Các danh mục quản lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogModules.map((module) => {
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
    </div>
  );
}

