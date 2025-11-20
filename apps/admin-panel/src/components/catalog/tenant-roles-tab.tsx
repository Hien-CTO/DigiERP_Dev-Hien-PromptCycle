'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Save, Building2, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TenantResponse, TenantListResponse } from '@/types/tenant';
import { RoleResponse, RoleListResponse } from '@/types/role';
import apiClient from '@/lib/api';

export default function TenantRolesTab() {
  const [selectedTenantId, setSelectedTenantId] = useState<number | undefined>();
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Fetch tenants
  const { data: tenantsData, isLoading: tenantsLoading } = useQuery<TenantListResponse>({
    queryKey: ['tenants'],
    queryFn: () => apiClient.get('/api/tenants'),
  });

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery<RoleListResponse>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/api/roles'),
  });

  // Fetch tenant roles
  const { data: tenantRolesData, isLoading: tenantRolesLoading } = useQuery<RoleListResponse>({
    queryKey: ['tenant-roles', selectedTenantId],
    queryFn: () => apiClient.get(`/api/tenants/${selectedTenantId}/roles`),
    enabled: !!selectedTenantId,
  });

  // Load current tenant roles when data is fetched
  useEffect(() => {
    if (tenantRolesData?.roles) {
      setSelectedRoleIds(tenantRolesData.roles.map((r) => r.id));
    } else if (selectedTenantId && !tenantRolesLoading) {
      setSelectedRoleIds([]);
    }
  }, [tenantRolesData, selectedTenantId, tenantRolesLoading]);

  const assignRolesMutation = useMutation({
    mutationFn: ({ tenantId, roleIds }: { tenantId: number; roleIds: number[] }) =>
      apiClient.post(`/api/tenants/${tenantId}/roles`, { roleIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-roles', selectedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Gán roles cho tenant thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gán roles cho tenant thất bại');
    },
  });

  const handleTenantChange = (tenantId: string) => {
    const id = parseInt(tenantId);
    setSelectedTenantId(id);
    setSelectedRoleIds([]);
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    if (!selectedTenantId) {
      toast.error('Vui lòng chọn tenant');
      return;
    }
    if (selectedRoleIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một role');
      return;
    }
    assignRolesMutation.mutate({ tenantId: selectedTenantId, roleIds: selectedRoleIds });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gán Roles cho Tenant</h2>
        <p className="mt-1 text-gray-600">Chọn tenant và gán các roles cho tenant đó</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn Tenant và Roles</CardTitle>
          <CardDescription>
            Chọn tenant và các roles bạn muốn gán cho tenant đó
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tenant Selection */}
          <div>
            <Label htmlFor="tenant">Tenant *</Label>
            <Select value={selectedTenantId?.toString()} onValueChange={handleTenantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenantsData?.tenants?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id.toString()}>
                    {tenant.displayName} ({tenant.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Roles Selection */}
          {selectedTenantId && (
            <div>
              <Label>Roles *</Label>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
                {rolesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  rolesData?.roles?.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id)}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {role.displayName}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({role.name})
                        </span>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Current Tenant Roles */}
          {selectedTenantId && tenantRolesData && (
            <div>
              <Label>Roles hiện tại của tenant</Label>
              <div className="mt-2 space-y-2">
                {tenantRolesLoading ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : tenantRolesData.roles?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tenantRolesData.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role.displayName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có roles nào được gán</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedTenantId || selectedRoleIds.length === 0 || assignRolesMutation.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {assignRolesMutation.isPending ? 'Đang xử lý...' : 'Gán Roles'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

