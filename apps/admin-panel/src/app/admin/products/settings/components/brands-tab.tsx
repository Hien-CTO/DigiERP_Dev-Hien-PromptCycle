'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, BrandResponse } from '@/hooks/use-brands';
import { formatDate } from '@/lib/utils';
import { ImageIcon, Globe } from 'lucide-react';

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

const validateURL = (value: string): string => {
  return value.replace(/[<>"']/g, '');
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

export default function BrandsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);
  const [viewingBrand, setViewingBrand] = useState<BrandResponse | null>(null);

  const { data: brandsData, isLoading } = useBrands(currentPage, 1000);
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();

  const filteredBrands = brandsData?.brands?.filter((brand) => 
    searchTerm === '' || 
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${name}"?`)) {
      deleteBrandMutation.mutate(id, {
        onSuccess: () => toast.success('Xóa thương hiệu thành công'),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa thất bại'),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thương hiệu</h2>
          <p className="mt-1 text-gray-600">Quản lý các thương hiệu sản phẩm</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm thương hiệu
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thương hiệu</CardTitle>
          <CardDescription>{filteredBrands.length} thương hiệu</CardDescription>
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
                    <TableHead className="w-[15%]">Tên</TableHead>
                    <TableHead className="w-[8%]">Logo</TableHead>
                    <TableHead className="w-[12%]">Website</TableHead>
                    <TableHead className="w-[8%]">Mã</TableHead>
                    <TableHead className="w-[15%]">Mô tả</TableHead>
                    <TableHead className="w-[10%]">Trạng thái</TableHead>
                    <TableHead className="w-[12%]">Ngày tạo</TableHead>
                    <TableHead className="w-[12%]">Ngày cập nhật</TableHead>
                    <TableHead className="w-[8%]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => {
                    const isActive = isItemActive(brand);
                    // Use a composite key that includes is_active to force re-render when status changes
                    const brandKey = `${brand.id}-${(brand as any).is_active ?? (brand as any).isActive ?? 'unknown'}`;
                    return (
                    <TableRow key={brandKey}>
                      <TableCell>{brand.id}</TableCell>
                      <TableCell className="font-medium truncate">{brand.name}</TableCell>
                      <TableCell>
                        {brand.logo || (brand as any).logoUrl || (brand as any).logo_url ? (
                          <img 
                            src={brand.logo || (brand as any).logoUrl || (brand as any).logo_url} 
                            alt={brand.name}
                            className="h-10 w-10 object-contain rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded border bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="truncate">
                        {brand.website || (brand as any).websiteUrl ? (
                          <a 
                            href={brand.website || (brand as any).websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:underline"
                          >
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {brand.website || (brand as any).websiteUrl}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="truncate"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{brand.code || 'N/A'}</code></TableCell>
                      <TableCell className="truncate">{brand.description || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 truncate">
                        {(brand as any).createdAt || (brand as any).created_at ? formatDate((brand as any).createdAt || (brand as any).created_at) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 truncate">
                        {(brand as any).updatedAt || (brand as any).updated_at ? formatDate((brand as any).updatedAt || (brand as any).updated_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setViewingBrand(brand)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => setEditingBrand(brand)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Xóa" onClick={() => handleDelete(brand.id, brand.name)}>
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
      {viewingBrand && (
        <Dialog open={!!viewingBrand} onOpenChange={() => setViewingBrand(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết thương hiệu</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về thương hiệu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm font-medium">{viewingBrand.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã</label>
                  <p className="mt-1 text-sm font-medium"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{viewingBrand.code || 'N/A'}</code></p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="mt-1 text-sm font-medium">{viewingBrand.name}</p>
              </div>
              {viewingBrand.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mô tả</label>
                  <p className="mt-1 text-sm">{viewingBrand.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {viewingBrand.logo || (viewingBrand as any).logoUrl || (viewingBrand as any).logo_url ? (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Logo</label>
                    <div className="mt-1">
                      <img 
                        src={viewingBrand.logo || (viewingBrand as any).logoUrl || (viewingBrand as any).logo_url} 
                        alt={viewingBrand.name}
                        className="h-20 w-20 object-contain rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                {viewingBrand.website || (viewingBrand as any).websiteUrl ? (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="mt-1">
                      <a 
                        href={viewingBrand.website || (viewingBrand as any).websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="truncate">{viewingBrand.website || (viewingBrand as any).websiteUrl}</span>
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <p className="mt-1">
                  <Badge variant={isItemActive(viewingBrand) ? "default" : "secondary"}>
                    {isItemActive(viewingBrand) ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingBrand as any).createdAt || (viewingBrand as any).created_at 
                      ? formatDate((viewingBrand as any).createdAt || (viewingBrand as any).created_at) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {(viewingBrand as any).updatedAt || (viewingBrand as any).updated_at 
                      ? formatDate((viewingBrand as any).updatedAt || (viewingBrand as any).updated_at) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewingBrand(null)}>
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingBrand} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingBrand(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Chỉnh sửa' : 'Thêm'} thương hiệu</DialogTitle>
            <DialogDescription>
              {editingBrand ? 'Cập nhật' : 'Nhập'} thông tin thương hiệu
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            brand={editingBrand}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              setEditingBrand(null);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setEditingBrand(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BrandForm({ brand, onSuccess, onCancel }: { brand?: BrandResponse | null; onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    code: brand?.code || '',
    description: brand?.description || '',
    logo: brand?.logo || (brand as any)?.logoUrl || (brand as any)?.logo_url || '',
    website: brand?.website || (brand as any)?.websiteUrl || '',
    isActive: brand ? isItemActive(brand) : true,
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

  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Map to backend format (snake_case)
    // Only include logo_url and website if they have values (not empty strings)
    const submitData: any = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      is_active: formData.isActive, // Backend expects is_active
    };
    
    // Only include logo_url if it has a value
    if (formData.logo && formData.logo.trim() !== '') {
      submitData.logo_url = formData.logo;
    }
    
    // Only include website if it has a value
    if (formData.website && formData.website.trim() !== '') {
      submitData.website = formData.website;
    }
    
    if (brand) {
      updateBrandMutation.mutate({ id: brand.id, data: submitData }, {
        onSuccess: async () => {
          // Wait for queries to refetch
          await new Promise(resolve => setTimeout(resolve, 200));
          toast.success('Cập nhật thành công');
          onSuccess();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật thất bại'),
      });
    } else {
      createBrandMutation.mutate(submitData, {
        onSuccess: () => {
          toast.success('Tạo thành công');
          onSuccess();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo thất bại'),
      });
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
        <label className="text-sm font-medium">Logo URL</label>
        <Input
          value={formData.logo}
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateURL(rawValue);
            setFormData({ ...formData, logo: value });
            setFieldError(
              'logo',
              rawValue !== value,
              'Logo URL không được chứa ký tự đặc biệt nguy hiểm như <, >, ", \'',
            );
          }}
          placeholder="https://example.com/logo.png"
        />
        {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
        {formData.logo && (
          <div className="mt-2">
            <img 
              src={formData.logo} 
              alt="Logo preview" 
              className="h-20 w-20 object-contain border rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Website</label>
        <Input
          value={formData.website}
          onChange={(e) => {
            const rawValue = e.target.value;
            const value = validateURL(rawValue);
            setFormData({ ...formData, website: value });
            setFieldError(
              'website',
              rawValue !== value,
              'Website không được chứa ký tự đặc biệt nguy hiểm như <, >, ", \'',
            );
          }}
          placeholder="https://example.com hoặc www.example.com"
          type="text"
        />
        {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Có thể nhập với hoặc không có http:// hoặc https://
        </p>
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
        <Button type="submit" disabled={createBrandMutation.isPending || updateBrandMutation.isPending}>
          {createBrandMutation.isPending || updateBrandMutation.isPending ? 'Đang xử lý...' : brand ? 'Cập nhật' : 'Tạo'}
        </Button>
      </div>
    </form>
  );
}

