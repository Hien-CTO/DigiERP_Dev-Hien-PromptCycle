'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Shield, Loader2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TenantResponse, TenantListResponse } from '@/types/tenant';
import { RoleListResponse, RoleResponse } from '@/types/role';
import apiClient from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TenantsTable } from '@/components/tables/tenants-table';

const tenantSchema = z.object({
  code: z.string().min(1, 'Mã tenant là bắt buộc').max(20, 'Mã tenant tối đa 20 ký tự'),
  name: z.string().min(1, 'Tên tenant là bắt buộc').max(200, 'Tên tenant tối đa 200 ký tự'),
  displayName: z.string().min(1, 'Tên hiển thị là bắt buộc').max(200, 'Tên hiển thị tối đa 200 ký tự'),
  description: z.string().optional(),
  taxCode: z.string().max(20, 'Mã số thuế tối đa 20 ký tự').optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().max(20, 'Số điện thoại tối đa 20 ký tự').optional(),
  address: z.string().optional(),
  cityId: z.number().int().min(0).optional().or(z.literal(0)),
  provinceId: z.number().int().min(0).optional().or(z.literal(0)),
  countryId: z.number().int().min(0).optional().or(z.literal(0)),
  logoUrl: z.string().url('Logo URL không hợp lệ').optional().or(z.literal('')),
  website: z.string().url('Website URL không hợp lệ').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']),
  subscriptionTier: z.enum(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']),
  subscriptionExpiresAt: z.string().optional(),
  maxUsers: z.number().int().min(1, 'Số người dùng tối đa phải lớn hơn 0').optional(),
  maxStorageGb: z.number().int().min(1, 'Dung lượng lưu trữ tối đa phải lớn hơn 0').optional(),
  settings: z.record(z.any()).optional(),
  isActive: z.boolean(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

// Component to display tenant roles list
function TenantRolesList({ tenantId }: { tenantId?: number }) {
  const { data: rolesData, isLoading, error } = useQuery<RoleListResponse>({
    queryKey: ['tenant-roles', tenantId],
    queryFn: async () => {
      if (!tenantId) return { roles: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      const response = await apiClient.get<RoleListResponse>(`/api/tenants/${tenantId}/roles`);
      return response;
    },
    enabled: !!tenantId,
  });

  const roles = rolesData?.roles || [];

  if (!tenantId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có tenant được chọn</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Đang tải danh sách roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Đã xảy ra lỗi khi tải danh sách roles</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Tenant này chưa có roles nào</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng gán roles cho tenant</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Tổng số: <span className="font-semibold text-gray-900">{roles.length}</span> roles
        </p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 divide-y">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{role.displayName}</h3>
                    <Badge
                      variant={role.isActive ? 'default' : 'secondary'}
                      className={
                        role.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                    {role.isSystemRole && (
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        System Role
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {role.name}
                    </span>
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                    <span>Tạo: {formatDate(role.createdAt)}</span>
                    <span>Cập nhật: {formatDate(role.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TenantsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewRolesDialogOpen, setIsViewRolesDialogOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<TenantResponse | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantResponse | null>(null);
  const [settingsJson, setSettingsJson] = useState<string>('{}');
  const queryClient = useQueryClient();

  const { data: tenantsData, isLoading, error } = useQuery<TenantListResponse>({
    queryKey: ['tenants', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiClient.get<TenantListResponse>(`/api/tenants${params.toString() ? `?${params.toString()}` : ''}`);
      return response;
    },
  });

  const tenants = tenantsData?.tenants || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      status: 'ACTIVE',
      subscriptionTier: 'BASIC',
      cityId: 0,
      provinceId: 0,
      countryId: 0,
      maxUsers: 10,
      maxStorageGb: 10,
      isActive: true,
      settings: {},
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: TenantFormData) => apiClient.post('/api/tenants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tạo tenant thành công');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo tenant thất bại');
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TenantFormData> }) =>
      apiClient.put(`/api/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Cập nhật tenant thành công');
      setIsDialogOpen(false);
      setEditingTenant(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật tenant thất bại');
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Xóa tenant thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa tenant thất bại');
    },
  });

  const onSubmit = (data: TenantFormData) => {
    // Prepare data for submission
    const submitData: any = { ...data };
    
    // Parse settings from JSON string
    try {
      submitData.settings = settingsJson.trim() ? JSON.parse(settingsJson) : {};
    } catch {
      toast.error('Settings JSON không hợp lệ');
      return;
    }
    
    // Convert empty strings to undefined for optional fields
    if (submitData.email === '') submitData.email = undefined;
    if (submitData.logoUrl === '') submitData.logoUrl = undefined;
    if (submitData.website === '') submitData.website = undefined;
    if (submitData.subscriptionExpiresAt === '') submitData.subscriptionExpiresAt = undefined;
    
    // Convert 0 to undefined for optional ID fields
    if (submitData.cityId === 0) submitData.cityId = undefined;
    if (submitData.provinceId === 0) submitData.provinceId = undefined;
    if (submitData.countryId === 0) submitData.countryId = undefined;
    
    if (editingTenant) {
      updateTenantMutation.mutate({ id: editingTenant.id, data: submitData });
    } else {
      createTenantMutation.mutate(submitData);
    }
  };

  const handleEdit = (tenant: TenantResponse) => {
    setEditingTenant(tenant);
    setValue('code', tenant.code);
    setValue('name', tenant.name);
    setValue('displayName', tenant.displayName);
    setValue('description', tenant.description || '');
    setValue('taxCode', tenant.taxCode || '');
    setValue('email', tenant.email || '');
    setValue('phone', tenant.phone || '');
    setValue('address', tenant.address || '');
    setValue('cityId', tenant.cityId || 0);
    setValue('provinceId', tenant.provinceId || 0);
    setValue('countryId', tenant.countryId || 0);
    setValue('logoUrl', tenant.logoUrl || '');
    setValue('website', tenant.website || '');
    setValue('status', tenant.status);
    setValue('subscriptionTier', tenant.subscriptionTier);
    setValue('subscriptionExpiresAt', tenant.subscriptionExpiresAt || '');
    setValue('maxUsers', tenant.maxUsers || 10);
    setValue('maxStorageGb', tenant.maxStorageGb || 10);
    setValue('settings', tenant.settings || {});
    setValue('isActive', tenant.isActive);
    setSettingsJson(JSON.stringify(tenant.settings || {}, null, 2));
    setIsDialogOpen(true);
  };

  const handleDelete = (tenant: TenantResponse) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tenant "${tenant.displayName}"?`)) {
      deleteTenantMutation.mutate(tenant.id);
    }
  };

  const handleView = (tenant: TenantResponse) => {
    setViewingTenant(tenant);
    setIsViewRolesDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTenant(null);
    reset();
    setSettingsJson('{}');
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Tenants</h2>
          <p className="mt-1 text-gray-600">Quản lý danh sách tenants trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'Chỉnh sửa Tenant' : 'Thêm Tenant mới'}</DialogTitle>
              <DialogDescription>
                {editingTenant ? 'Cập nhật thông tin tenant' : 'Điền thông tin để tạo tenant mới'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Mã Tenant *</Label>
                  <Input id="code" {...register('code')} />
                  {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                </div>
                <div>
                  <Label htmlFor="name">Tên Tenant *</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxCode">Mã số thuế</Label>
                  <Input id="taxCode" {...register('taxCode')} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input id="address" {...register('address')} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cityId">City ID</Label>
                  <Input 
                    id="cityId" 
                    type="number" 
                    {...register('cityId', { valueAsNumber: true })} 
                  />
                  {errors.cityId && <p className="text-sm text-red-500">{errors.cityId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="provinceId">Province ID</Label>
                  <Input 
                    id="provinceId" 
                    type="number" 
                    {...register('provinceId', { valueAsNumber: true })} 
                  />
                  {errors.provinceId && <p className="text-sm text-red-500">{errors.provinceId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="countryId">Country ID</Label>
                  <Input 
                    id="countryId" 
                    type="number" 
                    {...register('countryId', { valueAsNumber: true })} 
                  />
                  {errors.countryId && <p className="text-sm text-red-500">{errors.countryId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" {...register('logoUrl')} />
                  {errors.logoUrl && <p className="text-sm text-red-500">{errors.logoUrl.message}</p>}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...register('website')} />
                  {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Trạng thái *</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="SUSPENDED">Tạm ngưng</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscriptionTier">Gói đăng ký *</Label>
                  <Select
                    value={watch('subscriptionTier')}
                    onValueChange={(value) => setValue('subscriptionTier', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Miễn phí</SelectItem>
                      <SelectItem value="BASIC">Cơ bản</SelectItem>
                      <SelectItem value="PREMIUM">Cao cấp</SelectItem>
                      <SelectItem value="ENTERPRISE">Doanh nghiệp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subscriptionExpiresAt">Ngày hết hạn gói</Label>
                  <Input 
                    id="subscriptionExpiresAt" 
                    type="date" 
                    {...register('subscriptionExpiresAt')} 
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsers">Số người dùng tối đa</Label>
                  <Input 
                    id="maxUsers" 
                    type="number" 
                    min="1"
                    {...register('maxUsers', { valueAsNumber: true })} 
                  />
                  {errors.maxUsers && <p className="text-sm text-red-500">{errors.maxUsers.message}</p>}
                </div>
                <div>
                  <Label htmlFor="maxStorageGb">Dung lượng lưu trữ tối đa (GB)</Label>
                  <Input 
                    id="maxStorageGb" 
                    type="number" 
                    min="1"
                    {...register('maxStorageGb', { valueAsNumber: true })} 
                  />
                  {errors.maxStorageGb && <p className="text-sm text-red-500">{errors.maxStorageGb.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="settings">Settings (JSON)</Label>
                <textarea
                  id="settings"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  value={settingsJson}
                  onChange={(e) => setSettingsJson(e.target.value)}
                  placeholder='{"key": "value"}'
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nhập JSON object (ví dụ: {"{}"})
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...register('isActive')}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Kích hoạt tenant
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    reset();
                    setEditingTenant(null);
                    setSettingsJson('{}');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createTenantMutation.isPending || updateTenantMutation.isPending
                  }
                >
                  {editingTenant ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Danh sách Tenants</CardTitle>
              <CardDescription>
                Tổng số: {tenantsData?.total || 0} tenant
              </CardDescription>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm tenant..."
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
              <p className="text-red-600">Đã xảy ra lỗi khi tải danh sách tenants</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
            </div>
          ) : (
            <TenantsTable
              tenants={tenants}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </CardContent>
      </Card>

      {/* View Roles Dialog */}
      <Dialog open={isViewRolesDialogOpen} onOpenChange={setIsViewRolesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Danh sách Roles của Tenant</DialogTitle>
            <DialogDescription>
              {viewingTenant ? `Các roles thuộc về tenant: ${viewingTenant.displayName}` : ''}
            </DialogDescription>
          </DialogHeader>
          <TenantRolesList tenantId={viewingTenant?.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

