'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
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
import { PermissionResponse, PermissionListResponse } from '@/types/permission';
import apiClient from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PermissionsTable } from '@/components/tables/permissions-table';

const permissionSchema = z.object({
  name: z.string().min(1, 'Tên permission là bắt buộc'),
  displayName: z.string().min(1, 'Tên hiển thị là bắt buộc'),
  description: z.string().optional(),
  resourceId: z.number().min(1, 'Resource ID là bắt buộc'),
  actionId: z.number().min(1, 'Action ID là bắt buộc'),
  isActive: z.boolean().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

export default function PermissionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: permissionsData, isLoading, error } = useQuery<PermissionListResponse>({
    queryKey: ['permissions', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiClient.get<PermissionListResponse>(`/api/permissions${params.toString() ? `?${params.toString()}` : ''}`);
      return response;
    },
  });

  const permissions = permissionsData?.permissions || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      isActive: true,
      resourceId: undefined,
      actionId: undefined,
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: (data: PermissionFormData) => apiClient.post('/api/permissions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Tạo permission thành công');
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo permission thất bại');
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PermissionFormData> }) =>
      apiClient.put(`/api/permissions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Cập nhật permission thành công');
      setIsDialogOpen(false);
      setEditingPermission(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật permission thất bại');
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Xóa permission thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa permission thất bại');
    },
  });

  const onSubmit = (data: PermissionFormData) => {
    if (editingPermission) {
      updatePermissionMutation.mutate({ id: editingPermission.id, data });
    } else {
      createPermissionMutation.mutate(data);
    }
  };

  const handleEdit = (permission: PermissionResponse) => {
    setEditingPermission(permission);
    setValue('name', permission.name);
    setValue('displayName', permission.displayName);
    setValue('description', permission.description || '');
    setValue('resourceId', permission.resourceId);
    setValue('actionId', permission.actionId);
    setValue('isActive', permission.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = (permission: PermissionResponse) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa permission "${permission.displayName}"?`)) {
      deletePermissionMutation.mutate(permission.id);
    }
  };

  const handleAddNew = () => {
    setEditingPermission(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Permissions</h2>
          <p className="mt-1 text-gray-600">Quản lý danh sách permissions trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? 'Chỉnh sửa Permission' : 'Thêm Permission mới'}
              </DialogTitle>
              <DialogDescription>
                {editingPermission
                  ? 'Cập nhật thông tin permission'
                  : 'Điền thông tin để tạo permission mới'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Permission *</Label>
                <Input id="name" {...register('name')} />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resourceId">Resource ID *</Label>
                  <Input
                    id="resourceId"
                    type="number"
                    {...register('resourceId', { valueAsNumber: true })}
                  />
                  {errors.resourceId && (
                    <p className="text-sm text-red-500">{errors.resourceId.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="actionId">Action ID *</Label>
                  <Input
                    id="actionId"
                    type="number"
                    {...register('actionId', { valueAsNumber: true })}
                  />
                  {errors.actionId && (
                    <p className="text-sm text-red-500">{errors.actionId.message}</p>
                  )}
                </div>
              </div>

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
                    setEditingPermission(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createPermissionMutation.isPending || updatePermissionMutation.isPending
                  }
                >
                  {editingPermission ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Danh sách Permissions</CardTitle>
              <CardDescription>
                Tổng số: {permissionsData?.total || 0} permission
              </CardDescription>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm permission..."
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
              <p className="text-red-600">Đã xảy ra lỗi khi tải danh sách permissions</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng thử lại sau</p>
            </div>
          ) : (
            <PermissionsTable
              permissions={permissions}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

