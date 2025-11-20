'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { usePackagingTypes, PackagingTypeResponse } from '@/hooks/use-packaging-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { formatDate } from '@/lib/utils';

const VIETNAMESE_CHARS =
  'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';
const NAME_ALLOWED_REGEX = new RegExp(
  `[^a-zA-Z0-9\\s\\.,\\(\\)${VIETNAMESE_CHARS}]`,
  'g',
);

const validateName = (value: string): string => value.normalize('NFC').replace(NAME_ALLOWED_REGEX, '');
const validateDescription = (value: string): string => value.normalize('NFC').replace(NAME_ALLOWED_REGEX, '');

// Helper function to check if item is active (handles both boolean and number)
function isItemActive(item: any): boolean {
  if (item?.isActive === true || item?.isActive === 1) return true;
  if (item?.is_active === 1) return true;
  if (item?.isActive === false || item?.isActive === 0) return false;
  if (item?.is_active === 0) return false;
  return true; // default
}

export default function PackagingTypesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<PackagingTypeResponse | null>(null);
  const [viewingPackaging, setViewingPackaging] = useState<PackagingTypeResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: packagingTypesData, isLoading } = usePackagingTypes(currentPage, 1000);

  const createPackagingMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/packaging-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packagingTypes'] });
      toast.success('Tạo loại đóng gói thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo thất bại'),
  });

  const updatePackagingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/api/packaging-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packagingTypes'] });
      toast.success('Cập nhật loại đóng gói thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật thất bại'),
  });

  const deletePackagingMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/packaging-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packagingTypes'] });
      toast.success('Xóa loại đóng gói thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa thất bại'),
  });

  const filteredPackagingTypes = packagingTypesData?.packagingTypes?.filter((packaging) => 
    searchTerm === '' || 
    packaging.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    packaging.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa loại đóng gói "${name}"?`)) {
      deletePackagingMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loại đóng gói</h2>
          <p className="mt-1 text-gray-600">Quản lý các loại đóng gói sản phẩm</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm loại đóng gói
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm loại đóng gói..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách loại đóng gói</CardTitle>
          <CardDescription>{filteredPackagingTypes.length} loại đóng gói</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Tên hiển thị</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackagingTypes.map((packaging) => (
                  <TableRow key={packaging.id}>
                    <TableCell>{packaging.id}</TableCell>
                    <TableCell className="font-medium">{packaging.name}</TableCell>
                    <TableCell className="font-medium">{packaging.displayName || (packaging as any).displayName || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{packaging.description || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={isItemActive(packaging) ? "default" : "secondary"}>
                        {isItemActive(packaging) ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {(packaging as any).createdAt || (packaging as any).created_at ? formatDate((packaging as any).createdAt || (packaging as any).created_at) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {(packaging as any).updatedAt || (packaging as any).updated_at ? formatDate((packaging as any).updatedAt || (packaging as any).updated_at) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setViewingPackaging(packaging)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => setEditingPackaging(packaging)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Xóa" onClick={() => handleDelete(packaging.id, packaging.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      {viewingPackaging && (
        <Dialog open={!!viewingPackaging} onOpenChange={() => setViewingPackaging(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết loại đóng gói</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về loại đóng gói
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="mt-1 text-sm font-medium">{viewingPackaging.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="mt-1 text-sm font-medium">{viewingPackaging.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên hiển thị</label>
                <p className="mt-1 text-sm font-medium">{viewingPackaging.displayName || (viewingPackaging as any).displayName || 'N/A'}</p>
              </div>
              {viewingPackaging.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mô tả</label>
                  <p className="mt-1 text-sm">{viewingPackaging.description}</p>
                </div>
              )}
              {(viewingPackaging.sortOrder !== undefined || (viewingPackaging as any).sortOrder !== undefined) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Thứ tự</label>
                  <p className="mt-1 text-sm font-medium">{viewingPackaging.sortOrder || (viewingPackaging as any).sortOrder || 0}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <p className="mt-1">
                  <Badge variant={isItemActive(viewingPackaging) ? "default" : "secondary"}>
                    {isItemActive(viewingPackaging) ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingPackaging as any).createdAt || (viewingPackaging as any).created_at 
                      ? formatDate((viewingPackaging as any).createdAt || (viewingPackaging as any).created_at) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingPackaging as any).updatedAt || (viewingPackaging as any).updated_at 
                      ? formatDate((viewingPackaging as any).updatedAt || (viewingPackaging as any).updated_at) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewingPackaging(null)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isCreateDialogOpen || !!editingPackaging} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingPackaging(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackaging ? 'Chỉnh sửa' : 'Thêm'} loại đóng gói</DialogTitle>
            <DialogDescription>
              {editingPackaging ? 'Cập nhật' : 'Nhập'} thông tin loại đóng gói
            </DialogDescription>
          </DialogHeader>
          <PackagingTypeForm
            packaging={editingPackaging}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              setEditingPackaging(null);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setEditingPackaging(null);
            }}
            createMutation={createPackagingMutation}
            updateMutation={updatePackagingMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackagingTypeForm({ 
  packaging, 
  onSuccess, 
  onCancel,
  createMutation,
  updateMutation,
}: { 
  packaging?: PackagingTypeResponse | null; 
  onSuccess: () => void; 
  onCancel: () => void;
  createMutation: any;
  updateMutation: any;
}) {
  const [formData, setFormData] = useState({
    name: packaging?.name || '',
    displayName: packaging?.displayName || (packaging as any)?.displayName || '',
    description: packaging?.description || '',
    sortOrder: packaging?.sortOrder || (packaging as any)?.sortOrder || 0,
    isActive: packaging ? isItemActive(packaging) : true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldError = (field: string, hasError: boolean, message: string) => {
    setErrors((prev) => {
      if (hasError) {
        if (prev[field] === message) return prev;
        return { ...prev, [field]: message };
      }
      if (!(field in prev)) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Map to backend format
    const submitData: any = {
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description || '',
      sortOrder: formData.sortOrder || 0,
      isActive: formData.isActive,
    };
    
    if (packaging) {
      updateMutation.mutate({ id: packaging.id, data: submitData }, { onSuccess });
    } else {
      createMutation.mutate(submitData, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Tên *</label>
        <Input
          value={formData.name}
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateName(rawValue);
            setFormData({ ...formData, name: value });
            setFieldError(
              'name',
              rawValue !== value,
              'Tên chỉ cho phép chữ, số, khoảng trắng và các ký tự .,()',
            );
          }}
          required
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Tên hiển thị *</label>
        <Input 
          value={formData.displayName} 
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateName(rawValue);
            setFormData({ ...formData, displayName: value });
            setFieldError(
              'displayName',
              rawValue !== value,
              'Tên hiển thị chỉ cho phép chữ, số, khoảng trắng và các ký tự .,()',
            );
          }} 
          required
          maxLength={100}
        />
        {errors.displayName && (
          <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Mô tả</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.description}
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateDescription(rawValue);
            setFormData({ ...formData, description: value });
            setFieldError(
              'description',
              rawValue !== value,
              'Mô tả chỉ cho phép chữ, số, khoảng trắng và các ký tự .,()',
            );
          }}
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Sắp xếp</label>
        <Input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          min={0}
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium">Đang hoạt động</label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : packaging ? 'Cập nhật' : 'Tạo'}
        </Button>
      </div>
    </form>
  );
}

