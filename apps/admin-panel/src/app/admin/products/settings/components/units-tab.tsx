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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUnits, UnitResponse } from '@/hooks/use-units';
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
const validateCode = (value: string): string => value.replace(/[^a-zA-Z0-9\-_]/g, '');
const validateSymbol = (value: string): string => value.replace(/[^a-zA-Z0-9]/g, '');
const validateType = (value: string): string => value.replace(/[^A-Z_]/g, '').toUpperCase();

// Helper function to check if item is active (handles both boolean and number)
function isItemActive(item: any): boolean {
  // Check snake_case first (from API)
  if (item?.is_active !== undefined) {
    return item.is_active === true || item.is_active === 1;
  }
  // Check camelCase (fallback)
  if (item?.isActive !== undefined) {
    return item.isActive === true || item.isActive === 1;
  }
  // Default to false if not specified (safer than true)
  return false;
}

export default function UnitsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitResponse | null>(null);
  const [viewingUnit, setViewingUnit] = useState<UnitResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: unitsData, isLoading } = useUnits(currentPage, 1000);

  const createUnitMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/units', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Tạo đơn vị thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo thất bại'),
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/api/units/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['units'], exact: false });
      await queryClient.refetchQueries({ queryKey: ['units'], exact: false });
      toast.success('Cập nhật đơn vị thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật thất bại'),
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/units/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Xóa đơn vị thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa thất bại'),
  });

  const filteredUnits = unitsData?.units?.filter((unit) => 
    searchTerm === '' || 
    unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn vị "${name}"?`)) {
      deleteUnitMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Đơn vị</h2>
          <p className="mt-1 text-gray-600">Quản lý các đơn vị sản phẩm</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm đơn vị
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn vị</CardTitle>
          <CardDescription>{filteredUnits.length} đơn vị</CardDescription>
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
                  <TableHead>Mã</TableHead>
                  <TableHead>Ký hiệu</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => {
                  const isActive = isItemActive(unit);
                  // Use a composite key that includes is_active to force re-render when status changes
                  const unitKey = `${unit.id}-${(unit as any).is_active ?? (unit as any).isActive ?? 'unknown'}`;
                  return (
                  <TableRow key={unitKey}>
                    <TableCell>{unit.id}</TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell><code className="bg-gray-100 px-2 py-1 rounded text-xs">{unit.code || 'N/A'}</code></TableCell>
                    <TableCell>{unit.symbol || (unit as any).symbol || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {unit.type || (unit as any).type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {(unit as any).createdAt || (unit as any).created_at ? formatDate((unit as any).createdAt || (unit as any).created_at) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {(unit as any).updatedAt || (unit as any).updated_at ? formatDate((unit as any).updatedAt || (unit as any).updated_at) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setViewingUnit(unit)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => setEditingUnit(unit)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Xóa" onClick={() => handleDelete(unit.id, unit.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      {viewingUnit && (
        <Dialog open={!!viewingUnit} onOpenChange={() => setViewingUnit(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết đơn vị</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về đơn vị
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm font-medium">{viewingUnit.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã</label>
                  <p className="mt-1 text-sm font-medium"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{viewingUnit.code || 'N/A'}</code></p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="mt-1 text-sm font-medium">{viewingUnit.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ký hiệu</label>
                  <p className="mt-1 text-sm font-medium">{viewingUnit.symbol || (viewingUnit as any).symbol || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại</label>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {viewingUnit.type || (viewingUnit as any).type || 'N/A'}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <p className="mt-1">
                  <Badge variant={isItemActive(viewingUnit) ? "default" : "secondary"}>
                    {isItemActive(viewingUnit) ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingUnit as any).createdAt || (viewingUnit as any).created_at 
                      ? formatDate((viewingUnit as any).createdAt || (viewingUnit as any).created_at) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingUnit as any).updatedAt || (viewingUnit as any).updated_at 
                      ? formatDate((viewingUnit as any).updatedAt || (viewingUnit as any).updated_at) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewingUnit(null)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isCreateDialogOpen || !!editingUnit} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingUnit(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Chỉnh sửa' : 'Thêm'} đơn vị</DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Cập nhật' : 'Nhập'} thông tin đơn vị
            </DialogDescription>
          </DialogHeader>
          <UnitForm
            unit={editingUnit}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              setEditingUnit(null);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setEditingUnit(null);
            }}
            createMutation={createUnitMutation}
            updateMutation={updateUnitMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UnitForm({ 
  unit, 
  onSuccess, 
  onCancel,
  createMutation,
  updateMutation,
}: { 
  unit?: UnitResponse | null; 
  onSuccess: () => void; 
  onCancel: () => void;
  createMutation: any;
  updateMutation: any;
}) {
  const [formData, setFormData] = useState({
    name: unit?.name || '',
    code: unit?.code || '',
    symbol: unit?.symbol || (unit as any)?.symbol || '',
    type: unit?.type || (unit as any)?.type || 'OTHER',
    isActive: unit ? isItemActive(unit) : true,
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
    // Map to backend format (snake_case)
    const submitData: any = {
      name: formData.name,
      code: formData.code,
      symbol: formData.symbol,
      type: formData.type,
      is_active: formData.isActive,
    };
    
    if (unit) {
      updateMutation.mutate({ id: unit.id, data: submitData }, { 
        onSuccess: async () => {
          // Wait a bit to ensure query is refetched
          await new Promise(resolve => setTimeout(resolve, 100));
          onSuccess();
        }
      });
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
        <label className="text-sm font-medium">Mã</label>
        <Input
          value={formData.code}
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateCode(rawValue);
            setFormData({ ...formData, code: value });
            setFieldError(
              'code',
              rawValue !== value,
              'Mã chỉ cho phép chữ, số, dấu gạch ngang (-) và gạch dưới (_)',
            );
          }}
        />
        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Ký hiệu *</label>
        <Input 
          value={formData.symbol} 
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateSymbol(rawValue);
            setFormData({ ...formData, symbol: value });
            setFieldError(
              'symbol',
              rawValue !== value,
              'Ký hiệu chỉ cho phép chữ và số, tối đa 10 ký tự.',
            );
          }} 
          required
          maxLength={10}
          placeholder="Ví dụ: kg, m, l, pcs"
        />
        {errors.symbol && <p className="text-xs text-red-500 mt-1">{errors.symbol}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Loại *</label>
        <Input 
          value={formData.type} 
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateType(rawValue);
            setFormData({ ...formData, type: value });
            setFieldError(
              'type',
              rawValue !== value,
              'Loại chỉ cho phép chữ in hoa và dấu gạch dưới (_).',
            );
          }} 
          required
          placeholder="Ví dụ: WEIGHT, LENGTH, VOLUME, PIECE, OTHER"
        />
        {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
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
          {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : unit ? 'Cập nhật' : 'Tạo'}
        </Button>
      </div>
    </form>
  );
}

