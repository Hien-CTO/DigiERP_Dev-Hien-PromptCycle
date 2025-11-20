'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, DollarSign, Eye } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  useProductPrices, 
  useCreateProductPrice, 
  useUpdateProductPrice, 
  useDeleteProductPrice,
  ProductPriceResponse,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
} from '@/hooks/use-product-prices';
import { useProducts } from '@/hooks/use-products';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ProductPricingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ProductPriceResponse | null>(null);
  const [viewingPrice, setViewingPrice] = useState<ProductPriceResponse | null>(null);
  const [filterProductId, setFilterProductId] = useState<number | undefined>(undefined);
  const queryClient = useQueryClient();

  // Fetch product prices
  const { data: pricesData, isLoading, error } = useProductPrices(
    currentPage,
    50,
    searchTerm,
    filterProductId,
  );

  // Mutations
  const createPriceMutation = useCreateProductPrice();
  const updatePriceMutation = useUpdateProductPrice();
  const deletePriceMutation = useDeleteProductPrice();

  // Fetch products for filter
  const { data: productsData } = useProducts(1, 1000);

  // Filter prices
  const filteredPrices = pricesData?.prices || [];

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bảng giá này?')) {
      deletePriceMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Xóa bảng giá thành công');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Xóa bảng giá thất bại');
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý giá sản phẩm</h1>
          <p className="mt-2 text-gray-600">
            Quản lý bảng giá và tính toán giá sản phẩm
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm bảng giá
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm bảng giá mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin bảng giá để tạo mới
              </DialogDescription>
            </DialogHeader>
            <ProductPriceForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo ghi chú, giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterProductId ? filterProductId.toString() : 'all'}
              onValueChange={(value) => setFilterProductId(value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                {productsData?.products?.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bảng giá</CardTitle>
          <CardDescription>
            {filteredPrices.length} bảng giá được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="w-full overflow-hidden">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[5%]">ID</TableHead>
                      <TableHead className="w-[25%]">Sản phẩm</TableHead>
                      <TableHead className="w-[20%]">Giá</TableHead>
                      <TableHead className="w-[20%]">Giá tài liệu</TableHead>
                      <TableHead className="w-[8%]">Trạng thái</TableHead>
                      <TableHead className="w-[8%]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices.map((price) => {
                      const product = productsData?.products?.find(p => p.id === price.productId);
                      return (
                        <TableRow key={price.id}>
                          <TableCell>{price.id}</TableCell>
                          <TableCell className="truncate">
                            {product ? `${product.name} (${product.sku})` : `ID: ${price.productId}`}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(price.price)}
                          </TableCell>
                          <TableCell>
                            {price.documentPrice ? formatCurrency(price.documentPrice) : <span className="text-gray-400">-</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={price.isActive ? 'default' : 'secondary'}>
                              {price.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Xem chi tiết"
                                onClick={() => setViewingPrice(price)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Chỉnh sửa"
                                onClick={() => setEditingPrice(price)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Xóa"
                                onClick={() => handleDelete(price.id)}
                                disabled={deletePriceMutation.isPending}
                              >
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

              {filteredPrices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy bảng giá nào</p>
                </div>
              )}

              {/* Pagination */}
              {pricesData && pricesData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * 50) + 1} đến {Math.min(currentPage * 50, pricesData.total)} trong tổng số {pricesData.total} kết quả
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {pricesData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(pricesData.totalPages, prev + 1))}
                      disabled={currentPage === pricesData.totalPages}
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
      {viewingPrice && (
        <ViewPriceDetailDialog
          price={viewingPrice}
          onClose={() => setViewingPrice(null)}
        />
      )}

      {/* Edit Dialog */}
      {editingPrice && (
        <Dialog open={!!editingPrice} onOpenChange={() => setEditingPrice(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bảng giá</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin bảng giá
              </DialogDescription>
            </DialogHeader>
            <ProductPriceForm
              price={editingPrice}
              onSuccess={() => setEditingPrice(null)}
              onCancel={() => setEditingPrice(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Product Price Form Component
function ProductPriceForm({
  price,
  onSuccess,
  onCancel,
}: {
  price?: ProductPriceResponse;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CreateProductPriceRequest>({
    productId: price?.productId || 0,
    price: price?.price || 0,
    documentPrice: price?.documentPrice,
    isActive: price?.isActive !== undefined ? price.isActive : true,
    notes: price?.notes || '',
  });

  const { data: productsData } = useProducts(1, 1000);
  const createMutation = useCreateProductPrice();
  const updateMutation = useUpdateProductPrice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productId || formData.productId === 0) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }


    const submitData: any = { ...formData };
    
    // Clean up undefined values and empty strings
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === undefined || submitData[key] === '') {
        delete submitData[key];
      }
    });

    if (price) {
      // Remove productId from update request (not allowed to change productId)
      delete submitData.productId;
      
      updateMutation.mutate(
        { id: price.id, data: submitData },
        {
          onSuccess: () => {
            toast.success('Cập nhật bảng giá thành công');
            onSuccess();
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
          },
        },
      );
    } else {
      createMutation.mutate(submitData, {
        onSuccess: () => {
          toast.success('Tạo bảng giá thành công');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Tạo thất bại');
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Sản phẩm *</label>
        <Select
          value={formData.productId.toString()}
          onValueChange={(value) => setFormData({ ...formData, productId: parseInt(value) })}
          disabled={!!price}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            {productsData?.products?.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name} ({product.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Giá *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Giá tài liệu</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.documentPrice || ''}
            onChange={(e) => setFormData({ ...formData, documentPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Ghi chú</label>
        <Input
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
          placeholder="Nhập ghi chú..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <label className="text-sm font-medium">Hoạt động</label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {price ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}

// View Price Detail Dialog
function ViewPriceDetailDialog({
  price,
  onClose,
}: {
  price: ProductPriceResponse;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts(1, 1000);
  const product = productsData?.products?.find(p => p.id === price.productId);

  return (
    <Dialog open={!!price} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết bảng giá</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về bảng giá</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="mt-1 text-sm font-medium">{price.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Product ID</label>
                <p className="mt-1 text-sm font-medium">{price.productId}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Sản phẩm</label>
                <p className="mt-1 text-sm font-medium">
                  {product ? `${product.name} (${product.sku})` : `ID: ${price.productId}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <p className="mt-1">
                  <Badge variant={price.isActive ? 'default' : 'secondary'}>
                    {price.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Thông tin giá</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Giá</label>
                <p className="mt-1 text-lg font-bold text-green-600">{formatCurrency(price.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giá tài liệu</label>
                <p className="mt-1 text-sm font-medium">
                  {price.documentPrice ? formatCurrency(price.documentPrice) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Ghi chú</h3>
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{price.notes || 'N/A'}</p>
            </div>
          </div>

          {/* Audit Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Thông tin audit</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created By</label>
                <p className="mt-1 text-sm font-medium">{price.createdBy ?? 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated By</label>
                <p className="mt-1 text-sm font-medium">{price.updatedBy ?? 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-600">{formatDate(price.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p className="mt-1 text-sm text-gray-600">{formatDate(price.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
