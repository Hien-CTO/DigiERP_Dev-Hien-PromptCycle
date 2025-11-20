'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Box, Package, Layers } from 'lucide-react';
import BrandsTab from './components/brands-tab';
import ModelsTab from './components/models-tab';
import UnitsTab from './components/units-tab';
import PackagingTypesTab from './components/packaging-types-tab';

export default function ProductSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt sản phẩm</h1>
        <p className="mt-2 text-gray-600">
          Quản lý các thiết lập sản phẩm: Thương hiệu, Formula Product, Đơn vị, Loại đóng gói
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt</CardTitle>
          <CardDescription>
            Quản lý các thiết lập liên quan đến sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="brands" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="brands" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Thương hiệu
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Formula Product
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                Đơn vị
              </TabsTrigger>
              <TabsTrigger value="packaging" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Loại đóng gói
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="brands" className="mt-6">
              <BrandsTab />
            </TabsContent>
            
            <TabsContent value="models" className="mt-6">
              <ModelsTab />
            </TabsContent>
            
            <TabsContent value="units" className="mt-6">
              <UnitsTab />
            </TabsContent>
            
            <TabsContent value="packaging" className="mt-6">
              <PackagingTypesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

