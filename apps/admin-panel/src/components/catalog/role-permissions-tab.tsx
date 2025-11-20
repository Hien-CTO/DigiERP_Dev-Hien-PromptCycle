'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Save, Shield, Key, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RoleResponse, RoleListResponse } from '@/types/role';
import { PermissionResponse, PermissionListResponse } from '@/types/permission';
import apiClient from '@/lib/api';

export default function RolePermissionsTab() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery<RoleListResponse>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/api/roles'),
  });

  // Fetch permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery<PermissionListResponse>({
    queryKey: ['permissions'],
    queryFn: () => apiClient.get('/api/permissions'),
  });

  // Fetch role permissions
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } =
    useQuery<{ permissions: PermissionResponse[] }>({
      queryKey: ['role-permissions', selectedRoleId],
      queryFn: () => apiClient.get(`/api/roles/${selectedRoleId}/permissions`),
      enabled: !!selectedRoleId,
    });

  // Load current role permissions when data is fetched
  useEffect(() => {
    if (rolePermissionsData?.permissions) {
      setSelectedPermissionIds(rolePermissionsData.permissions.map((p) => p.id));
    } else if (selectedRoleId && !rolePermissionsLoading) {
      setSelectedPermissionIds([]);
    }
  }, [rolePermissionsData, selectedRoleId, rolePermissionsLoading]);

  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      apiClient.post(`/api/permissions/roles/${roleId}/assign`, { permissionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Gán permissions cho role thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gán permissions cho role thất bại');
    },
  });

  const handleRoleChange = (roleId: string) => {
    const id = parseInt(roleId);
    setSelectedRoleId(id);
    setSelectedPermissionIds([]);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    if (permissionsData?.permissions) {
      setSelectedPermissionIds(permissionsData.permissions.map((p) => p.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds([]);
  };

  const handleSubmit = () => {
    if (!selectedRoleId) {
      toast.error('Vui lòng chọn role');
      return;
    }

    // Check if role is system role
    const selectedRole = rolesData?.roles?.find((r) => r.id === selectedRoleId);
    if (selectedRole?.isSystemRole) {
      toast.error('Không thể gán permissions cho system role');
      return;
    }

    if (selectedPermissionIds.length === 0) {
      // Allow submitting empty array to remove all permissions
      if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả permissions khỏi role này?')) {
        return;
      }
    }

    assignPermissionsMutation.mutate({ roleId: selectedRoleId, permissionIds: selectedPermissionIds });
  };

  const selectedRole = rolesData?.roles?.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gán Permissions cho Role</h2>
        <p className="mt-1 text-gray-600">Chọn role và gán các permissions cho role đó</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn Role và Permissions</CardTitle>
          <CardDescription>
            Chọn role và các permissions bạn muốn gán cho role đó
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={selectedRoleId?.toString()} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn role" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    <div className="flex items-center gap-2">
                      {role.displayName} ({role.name})
                      {role.isSystemRole && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole?.isSystemRole && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  System roles không thể được chỉnh sửa. Vui lòng chọn role khác.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Permissions Selection */}
          {selectedRoleId && !selectedRole?.isSystemRole && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Permissions *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={permissionsLoading || selectedPermissionIds.length === permissionsData?.permissions?.length}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={selectedPermissionIds.length === 0}
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
                {permissionsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : permissionsData?.permissions?.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Không có permissions nào trong hệ thống
                    </AlertDescription>
                  </Alert>
                ) : (
                  permissionsData?.permissions?.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={selectedPermissionIds.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span>{permission.displayName}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            ({permission.name})
                          </span>
                        </div>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {selectedPermissionIds.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Đã chọn: <span className="font-semibold">{selectedPermissionIds.length}</span> permissions
                </p>
              )}
            </div>
          )}

          {/* Current Role Permissions */}
          {selectedRoleId && !selectedRole?.isSystemRole && (
            <div>
              <Label>Permissions hiện tại của role</Label>
              <div className="mt-2 space-y-2">
                {rolePermissionsLoading ? (
                  <div className="flex items-center justify-center h-16">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : rolePermissionsData?.permissions && rolePermissionsData.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {rolePermissionsData.permissions.map((permission) => {
                      const displayText = permission.displayName || permission.name || `Permission ${permission.id}`;
                      return (
                        <Badge
                          key={permission.id}
                          variant="secondary"
                          className="px-3 py-1.5 text-xs bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                        >
                          {displayText}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Role này chưa có permissions nào được gán
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedRoleId ||
              selectedRole?.isSystemRole ||
              assignPermissionsMutation.isPending ||
              rolesLoading ||
              permissionsLoading ||
              rolePermissionsLoading
            }
            className="w-full"
          >
            {assignPermissionsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {selectedPermissionIds.length === 0
                  ? 'Xóa tất cả Permissions'
                  : `Gán ${selectedPermissionIds.length} Permissions`}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

