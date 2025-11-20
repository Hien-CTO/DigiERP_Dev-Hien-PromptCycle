'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Building2, Shield, Key, Link2, ShieldCheck } from 'lucide-react';
import TenantsTab from '@/components/catalog/tenants-tab';
import RolesTab from '@/components/catalog/roles-tab';
import PermissionsTab from '@/components/catalog/permissions-tab';
import TenantRolesTab from '@/components/catalog/tenant-roles-tab';
import RolePermissionsTab from '@/components/catalog/role-permissions-tab';

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Danh mục hệ thống</h1>
        <p className="mt-2 text-gray-600">
          Quản lý tenants, roles, permissions và các liên kết giữa chúng
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="tenants" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger value="tenants" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Building2 className="h-4 w-4 mr-2" />
                Tenants
              </TabsTrigger>
              <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Shield className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Key className="h-4 w-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="tenant-roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Link2 className="h-4 w-4 mr-2" />
                Gán Roles cho Tenant
              </TabsTrigger>
              <TabsTrigger value="role-permissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Gán Permissions cho Role
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tenants" className="m-0 p-6">
              <TenantsTab />
            </TabsContent>

            <TabsContent value="roles" className="m-0 p-6">
              <RolesTab />
            </TabsContent>

            <TabsContent value="permissions" className="m-0 p-6">
              <PermissionsTab />
            </TabsContent>

            <TabsContent value="tenant-roles" className="m-0 p-6">
              <TenantRolesTab />
            </TabsContent>

            <TabsContent value="role-permissions" className="m-0 p-6">
              <RolePermissionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

