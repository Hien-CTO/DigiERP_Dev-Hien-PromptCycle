'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Package, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';
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

export default function ProductCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useCategories(currentPage, 50);

  // Mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Filter categories
  const filteredCategories = categoriesData?.categories?.filter((category: any) => 
    searchTerm === '' || 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Xóa danh mục thành công');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Xóa danh mục thất bại');
        },
      });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Danh mục Loại Sản Phẩm</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin danh mục để tạo mới
              </DialogDescription>
            </DialogHeader>
            <CategoryForm 
              onSuccess={() => setIsCreateDialogOpen(false)} 
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
          <CardDescription>
            {filteredCategories.length} danh mục được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Danh mục cha</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Ngày cập nhật</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.id}</TableCell>
                      <TableCell className="font-medium">{category.name || 'N/A'}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {category.code || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        {category.parentCategory ? (
                          <Badge variant="outline">{category.parentCategory}</Badge>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {category.createdAt || (category as any).created_at ? formatDate(category.createdAt || (category as any).created_at) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {category.updatedAt || (category as any).updated_at ? formatDate(category.updatedAt || (category as any).updated_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xem chi tiết"
                            onClick={() => setViewingCategory(category)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Chỉnh sửa"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDelete(category.id, category.name || category.displayName || category.code)}
                            disabled={deleteCategoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCategories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy danh mục nào</p>
                </div>
              )}

              {/* Pagination */}
              {categoriesData && categoriesData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * 50) + 1} đến {Math.min(currentPage * 50, categoriesData.total)} trong tổng số {categoriesData.total} kết quả
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {categoriesData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev: number) => Math.min(categoriesData.totalPages, prev + 1))}
                      disabled={currentPage === categoriesData.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      {viewingCategory && (
        <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết danh mục</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về danh mục
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm font-medium">{viewingCategory.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã</label>
                  <p className="mt-1 text-sm font-medium"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{viewingCategory.code || 'N/A'}</code></p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="mt-1 text-sm font-medium">{viewingCategory.name || 'N/A'}</p>
              </div>
              {viewingCategory.displayName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên hiển thị</label>
                  <p className="mt-1 text-sm font-medium">{viewingCategory.displayName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="mt-1 text-sm">{viewingCategory.description || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <p className="mt-1">
                    <Badge variant={viewingCategory.isActive ? "default" : "secondary"}>
                      {viewingCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </p>
                </div>
                {viewingCategory.sortOrder !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Thứ tự</label>
                    <p className="mt-1 text-sm font-medium">{viewingCategory.sortOrder}</p>
                  </div>
                )}
              </div>
              {viewingCategory.parentCategory && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Danh mục cha</label>
                  <p className="mt-1">
                    <Badge variant="outline">{viewingCategory.parentCategory}</Badge>
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {viewingCategory.createdAt || (viewingCategory as any).created_at 
                      ? formatDate(viewingCategory.createdAt || (viewingCategory as any).created_at) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {viewingCategory.updatedAt || (viewingCategory as any).updated_at 
                      ? formatDate(viewingCategory.updatedAt || (viewingCategory as any).updated_at) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewingCategory(null)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin danh mục
              </DialogDescription>
            </DialogHeader>
            <CategoryForm 
              category={editingCategory}
              onSuccess={() => setEditingCategory(null)} 
              onCancel={() => setEditingCategory(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Category Form Component
function CategoryForm({ 
  category, 
  onSuccess, 
  onCancel 
}: { 
  category?: any; 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    code: category?.code || '',
    description: category?.description || '',
    parentId: category?.parentId || undefined,
    isActive: category?.isActive !== undefined ? category.isActive : true,
    sortOrder: category?.sortOrder || 0,
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

  // Fetch all categories for parent selection
  const { data: allCategoriesData } = useCategories(1, 1000);
  const availableCategories = allCategoriesData?.categories?.filter((c: any) => 
    !category || c.id !== category.id // Exclude current category when editing
  ) || [];

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prepare data - remove undefined values
    const submitData: any = {
      name: formData.name,
      code: formData.code,
      description: formData.description || '',
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };
    
    // Only include parentId if it's defined
    if (formData.parentId !== undefined && formData.parentId !== null) {
      submitData.parentId = formData.parentId;
    }
    
    if (category) {
      // Update
      updateCategoryMutation.mutate({
        id: category.id,
        data: submitData as UpdateCategoryRequest,
      }, {
        onSuccess: () => {
          toast.success('Cập nhật danh mục thành công');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Cập nhật danh mục thất bại');
        },
      });
    } else {
      // Create
      createCategoryMutation.mutate(submitData as CreateCategoryRequest, {
        onSuccess: () => {
          toast.success('Tạo danh mục thành công');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Tạo danh mục thất bại');
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
          <label className="text-sm font-medium">Mã *</label>
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
            required
          />
          {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Danh mục cha</label>
        <Select
          value={formData.parentId ? formData.parentId.toString() : 'none'}
          onValueChange={(value) => {
            setFormData({ 
              ...formData, 
              parentId: value === 'none' ? undefined : parseInt(value) 
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không có danh mục cha</SelectItem>
            {availableCategories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name || cat.code || `Category ${cat.id}`}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Thứ tự</label>
          <Input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium">Đang hoạt động</label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
          {createCategoryMutation.isPending || updateCategoryMutation.isPending 
            ? 'Đang xử lý...' 
            : category ? 'Cập nhật' : 'Tạo danh mục'}
        </Button>
      </div>
    </form>
  );
}

