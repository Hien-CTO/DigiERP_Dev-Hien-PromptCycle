'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Shield, Key, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TenantListResponse } from '@/types/tenant';
import { RoleListResponse, RoleResponse, CreateRoleRequest, UpdateRoleRequest, RolePermissionsResponse } from '@/types/role';
import apiClient from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RolesTable } from '@/components/tables/roles-table';

const roleSchema = z.object({
  name: z.string().min(1, 'Tên role là bắt buộc'),
  displayName: z.string().min(1, 'Tên hiển thị là bắt buộc'),
  description: z.string().optional(),
  isSystemRole: z.boolean().optional(),
  scope: z.enum(['GLOBAL', 'TENANT']).optional().default('TENANT'),
  tenantId: z.number().int({ message: 'Tenant ID là bắt buộc và phải là số nguyên' }).min(1, 'Tenant ID phải lớn hơn 0').optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  // tenantId is required when creating (not editing)
  return data.tenantId !== undefined && data.tenantId > 0;
}, {
  message: 'Tenant ID là bắt buộc và phải lớn hơn 0',
  path: ['tenantId'],
});

type RoleFormData = z.infer<typeof roleSchema>;

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RolesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState<RoleResponse | null>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const queryClient = useQueryClient();

  // Fetch tenants for tenant selection
  const { data: tenantsData, isLoading: isLoadingTenants } = useQuery<TenantListResponse>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await apiClient.get<TenantListResponse>('/api/tenants');
      return response;
    },
  });

  const tenants = tenantsData?.tenants || [];

  const { data: rolesData, isLoading, error } = useQuery<RoleListResponse>({
    queryKey: ['roles', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiClient.get<RoleListResponse>(`/api/roles${params.toString() ? `?${params.toString()}` : ''}`);
      return response;
    },
  });

  const { data: rolePermissionsData, isLoading: isLoadingPermissions } = useQuery<RolePermissionsResponse>({
    queryKey: ['role-permissions', viewingRole?.id],
    queryFn: async () => {
      if (!viewingRole?.id) return null;
      const response = await apiClient.get<RolePermissionsResponse>(`/api/roles/${viewingRole.id}/permissions`);
      return response;
    },
    enabled: !!viewingRole?.id && isViewDialogOpen,
  });

  const roles = rolesData?.roles || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      isActive: true,
      isSystemRole: false,
      scope: 'TENANT',
      tenantId: undefined,
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => apiClient.post('/api/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Tạo role thành công');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo role thất bại');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) =>
      apiClient.put(`/api/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Cập nhật role thành công');
      setIsDialogOpen(false);
      setEditingRole(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật role thất bại');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Xóa role thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa role thất bại');
    },
  });

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data });
    } else {
      // Validate tenantId before submitting
      if (!data.tenantId || data.tenantId <= 0) {
        toast.error('Vui lòng chọn tenant hợp lệ');
        return;
      }
      // Ensure tenantId is a number and scope is set
      const createData: CreateRoleRequest = {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        isSystemRole: data.isSystemRole || false,
        scope: data.scope || 'TENANT',
        tenantId: Number(data.tenantId),
        isActive: data.isActive ?? true,
      };
      createRoleMutation.mutate(createData);
    }
  };

  const handleView = (role: RoleResponse) => {
    setViewingRole(role);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (role: RoleResponse) => {
    setEditingRole(role);
    setValue('name', role.name);
    setValue('displayName', role.displayName);
    setValue('description', role.description || '');
    setValue('isSystemRole', role.isSystemRole);
    setValue('isActive', role.isActive);
    // Note: tenantId and scope cannot be edited after creation
    setIsDialogOpen(true);
  };

  const handleDelete = (role: RoleResponse) => {
    if (role.isSystemRole) {
      toast.error('Không thể xóa vai trò hệ thống');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.displayName}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const handleAddNew = () => {
    setEditingRole(null);
    reset();
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Roles</h2>
          <p className="mt-1 text-gray-600">Quản lý danh sách roles trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Chỉnh sửa Role' : 'Thêm Role mới'}</DialogTitle>
              <DialogDescription>
                {editingRole ? 'Cập nhật thông tin role' : 'Điền thông tin để tạo role mới'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Role *</Label>
                <Input id="name" {...register('name')} disabled={!!editingRole?.isSystemRole} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="displayName">Tên hiển thị *</Label>
                <Input id="displayName" {...register('displayName')} />
                {errors.displayName && (
                  <p className="text-sm text-red-500">{errors.displayName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input id="description" {...register('description')} />
              </div>

              {!editingRole && (
                <>
                  <div>
                    <Label htmlFor="scope">Scope *</Label>
                    <Select
                      value={watch('scope') || 'TENANT'}
                      onValueChange={(value: 'GLOBAL' | 'TENANT') => setValue('scope', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TENANT">TENANT</SelectItem>
                        <SelectItem value="GLOBAL">GLOBAL</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.scope && <p className="text-sm text-red-500">{errors.scope.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="tenantId">Tenant *</Label>
                    <Select
                      value={watch('tenantId')?.toString() || ''}
                      onValueChange={(value) => setValue('tenantId', Number(value))}
                      disabled={isLoadingTenants}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingTenants ? 'Đang tải...' : 'Chọn tenant'} />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants
                          .filter((tenant) => tenant.isActive && tenant.status === 'ACTIVE')
                          .map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                              {tenant.name} ({tenant.code})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.tenantId && <p className="text-sm text-red-500">{errors.tenantId.message}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isSystemRole"
                      checked={watch('isSystemRole')}
                      onCheckedChange={(checked) => setValue('isSystemRole', checked)}
                    />
                    <Label htmlFor="isSystemRole">Vai trò hệ thống</Label>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Kích hoạt</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    reset();
                    setEditingRole(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                >
                  {editingRole ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Role Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingRole?.isSystemRole ? (
                <Shield className="h-5 w-5 text-blue-600" />
              ) : (
                <Key className="h-5 w-5 text-blue-600" />
              )}
              Chi tiết Role: {viewingRole?.displayName}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và danh sách permissions của role
            </DialogDescription>
          </DialogHeader>

          {viewingRole && (
            <div className="space-y-6">
              {/* Role Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin Role</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-500">Tên Role</Label>
                      <p className="text-sm font-medium mt-1">{viewingRole.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-500">Tên hiển thị</Label>
                      <p className="text-sm font-medium mt-1">{viewingRole.displayName}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-500">Mô tả</Label>
                      <p className="text-sm mt-1">{viewingRole.description || 'Không có mô tả'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-500">Loại</Label>
                      <div className="mt-1">
                        <Badge
                          className={`text-xs px-2 py-1 ${
                            viewingRole.isSystemRole
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {viewingRole.isSystemRole ? 'Hệ thống' : 'Tùy chỉnh'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-500">Trạng thái</Label>
                      <div className="mt-1">
                        <Badge
                          className={`text-xs px-2 py-1 ${
                            viewingRole.isActive
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {viewingRole.isActive ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3 inline" />
                              Không hoạt động
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-500">Ngày tạo</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">{formatDate(viewingRole.createdAt)}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-500">Ngày cập nhật</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">{formatDate(viewingRole.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách Permissions</CardTitle>
                  <CardDescription>
                    {isLoadingPermissions
                      ? 'Đang tải...'
                      : `${rolePermissionsData?.permissions?.length || 0} permission được gán cho role này`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPermissions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : rolePermissionsData?.permissions && rolePermissionsData.permissions.length > 0 ? (
                    <div className="space-y-3">
                      {rolePermissionsData.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Key className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-sm">{permission.displayName}</span>
                              <Badge
                                className={`text-xs px-2 py-0.5 ${
                                  permission.isActive
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                }`}
                              >
                                {permission.isActive ? 'Hoạt động' : 'Không hoạt động'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{permission.name}</p>
                            {permission.description && (
                              <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Resource ID: {permission.resourceId}</span>
                              <span>Action ID: {permission.actionId}</span>
                              {permission.scope && <span>Scope: {permission.scope}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Key className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Role này chưa có permission nào được gán</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Danh sách Roles</CardTitle>
              <CardDescription>
                Tổng số: {rolesData?.total || 0} role
              </CardDescription>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Đã xảy ra lỗi khi tải danh sách roles</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
            </div>
          ) : (
            <RolesTable
              roles={roles}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

