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
import { useFormulaProducts, FormulaProductResponse } from '@/hooks/use-formula-products';
import { useBrands } from '@/hooks/use-brands';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { formatDate } from '@/lib/utils';

const VIETNAMESE_CHARS =
  'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';
const NAME_ALLOWED_REGEX = new RegExp(
  `[^a-zA-Z0-9\\s\\.,\\(\\)${VIETNAMESE_CHARS}]`,
  'g',
);

const validateName = (value: string): string => {
  return value.normalize('NFC').replace(NAME_ALLOWED_REGEX, '');
};

const validateDescription = (value: string): string => {
  return value.normalize('NFC').replace(NAME_ALLOWED_REGEX, '');
};

const validateCode = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9\-_]/g, '');
};

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

export default function ModelsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<FormulaProductResponse | null>(null);
  const [viewingModel, setViewingModel] = useState<FormulaProductResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: modelsData, isLoading } = useFormulaProducts(currentPage, 1000);
  const { data: brandsData } = useBrands(1, 1000);

  // Create brand map for display
  const brandMap = React.useMemo(() => {
    const map = new Map<number, string>();
    if (brandsData?.brands) {
      brandsData.brands.forEach((brand) => {
        if (brand.id) {
          map.set(brand.id, brand.name);
        }
      });
    }
    return map;
  }, [brandsData]);

  const createModelMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/formula-products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formula-products'] });
      toast.success('Tạo formula product thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo thất bại'),
  });

  const updateModelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/api/formula-products/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['formula-products'], exact: false });
      await queryClient.refetchQueries({ queryKey: ['formula-products'], exact: false });
      toast.success('Cập nhật formula product thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật thất bại'),
  });

  const deleteModelMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/formula-products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formula-products'] });
      toast.success('Xóa formula product thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa thất bại'),
  });

  const filteredModels = modelsData?.models?.filter((model) => 
    searchTerm === '' || 
    model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa formula product "${name}"?`)) {
      deleteModelMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formula Product</h2>
          <p className="mt-1 text-gray-600">Quản lý các formula product</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm formula product
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm formula product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách formula product</CardTitle>
          <CardDescription>{filteredModels.length} formula product</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%]">ID</TableHead>
                    <TableHead className="w-[12%]">Tên</TableHead>
                    <TableHead className="w-[8%]">Mã</TableHead>
                    <TableHead className="w-[12%]">Thương hiệu</TableHead>
                    <TableHead className="w-[18%]">Mô tả</TableHead>
                    <TableHead className="w-[10%]">Trạng thái</TableHead>
                    <TableHead className="w-[12%]">Ngày tạo</TableHead>
                    <TableHead className="w-[12%]">Ngày cập nhật</TableHead>
                    <TableHead className="w-[8%]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => {
                    const brandId = model.brandId || model.brand_id || (model.brand?.id);
                    const brandName = model.brand?.name || (brandId ? brandMap.get(brandId) : null);
                    const isActive = isItemActive(model);
                    // Use a composite key that includes is_active to force re-render when status changes
                    const modelKey = `${model.id}-${(model as any).is_active ?? (model as any).isActive ?? 'unknown'}`;
                    return (
                      <TableRow key={modelKey}>
                        <TableCell>{model.id}</TableCell>
                        <TableCell className="font-medium truncate">{model.name}</TableCell>
                        <TableCell className="truncate"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{model.code || 'N/A'}</code></TableCell>
                        <TableCell className="truncate">
                          {brandName ? (
                            <Badge variant="outline">{brandName}</Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="truncate">{model.description || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 truncate">
                          {(model as any).createdAt || (model as any).created_at ? formatDate((model as any).createdAt || (model as any).created_at) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 truncate">
                          {(model as any).updatedAt || (model as any).updated_at ? formatDate((model as any).updatedAt || (model as any).updated_at) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setViewingModel(model)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => setEditingModel(model)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Xóa" onClick={() => handleDelete(model.id, model.name)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      {viewingModel && (
        <Dialog open={!!viewingModel} onOpenChange={() => setViewingModel(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết formula product</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về formula product
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm font-medium">{viewingModel.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã</label>
                  <p className="mt-1 text-sm font-medium"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{viewingModel.code || 'N/A'}</code></p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="mt-1 text-sm font-medium">{viewingModel.name}</p>
              </div>
              {(viewingModel.brand || viewingModel.brandId || viewingModel.brand_id) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Thương hiệu</label>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {viewingModel.brand?.name || 
                       (viewingModel.brandId || viewingModel.brand_id ? brandMap.get(viewingModel.brandId || viewingModel.brand_id || 0) : null) || 
                       'N/A'}
                    </Badge>
                  </p>
                </div>
              )}
              {viewingModel.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mô tả</label>
                  <p className="mt-1 text-sm">{viewingModel.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <p className="mt-1">
                  <Badge variant={isItemActive(viewingModel) ? "default" : "secondary"}>
                    {isItemActive(viewingModel) ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingModel as any).createdAt || (viewingModel as any).created_at 
                      ? formatDate((viewingModel as any).createdAt || (viewingModel as any).created_at) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingModel as any).updatedAt || (viewingModel as any).updated_at 
                      ? formatDate((viewingModel as any).updatedAt || (viewingModel as any).updated_at) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewingModel(null)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isCreateDialogOpen || !!editingModel} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingModel(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Chỉnh sửa' : 'Thêm'} formula product</DialogTitle>
            <DialogDescription>
              {editingModel ? 'Cập nhật' : 'Nhập'} thông tin formula product
            </DialogDescription>
          </DialogHeader>
          <ModelForm
            model={editingModel}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              setEditingModel(null);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setEditingModel(null);
            }}
            createMutation={createModelMutation}
            updateMutation={updateModelMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModelForm({ 
  model, 
  onSuccess, 
  onCancel,
  createMutation,
  updateMutation,
}: { 
  model?: FormulaProductResponse | null; 
  onSuccess: () => void; 
  onCancel: () => void;
  createMutation: any;
  updateMutation: any;
}) {
  const { data: brandsData } = useBrands(1, 1000);
  
  const [formData, setFormData] = useState({
    name: model?.name || '',
    code: model?.code || '',
    description: model?.description || '',
    brandId: model?.brandId || model?.brand_id || (model?.brand?.id) || undefined,
    isActive: model ? isItemActive(model) : true,
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
    // Prepare data - map to backend format
    const submitData: any = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      is_active: formData.isActive,
    };
    
    // Only include brand_id if it's defined
    if (formData.brandId !== undefined && formData.brandId !== null) {
      submitData.brand_id = formData.brandId;
    }
    
    if (model) {
      updateMutation.mutate({ id: model.id, data: submitData }, { 
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
        <label className="text-sm font-medium">Thương hiệu</label>
        <Select
          value={formData.brandId ? formData.brandId.toString() : 'none'}
          onValueChange={(value) => {
            setFormData({ 
              ...formData, 
              brandId: value === 'none' ? undefined : parseInt(value) 
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn thương hiệu (tùy chọn)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không có thương hiệu</SelectItem>
            {brandsData?.brands?.map((brand) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : model ? 'Cập nhật' : 'Tạo'}
        </Button>
      </div>
    </form>
  );
}

