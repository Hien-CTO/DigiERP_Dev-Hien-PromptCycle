'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Package, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye, Edit, Trash2,
  Building2, Weight, Box, Star, CheckCircle2, XCircle, Clock, Calendar,
  PackageCheck, PackageX, Layers, Tag, Image as ImageIcon
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useProducts, useDeleteProduct, useUpdateProduct } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useMaterials } from '@/hooks/use-materials';
import { useBrands } from '@/hooks/use-brands';
import { useUnits } from '@/hooks/use-units';
import { useFormulaProducts } from '@/hooks/use-formula-products';
import { usePackagingTypes } from '@/hooks/use-packaging-types';
import { formatDate, getStatusColor, getStatusText, formatCurrency } from '@/lib/utils';
import { ProductResponse } from '@/types/product';
import apiClient from '@/lib/api';

// Helper functions để validate input và chặn ký tự đặc biệt
const validateSKU = (value: string): string => {
  // SKU chỉ cho phép chữ, số, gạch ngang, gạch dưới
  return value.replace(/[^a-zA-Z0-9\-_]/g, '');
};

const VIETNAMESE_CHARS =
  'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';
const NAME_ALLOWED_REGEX = new RegExp(
  `[^a-zA-Z0-9\\s\\.,\\(\\)${VIETNAMESE_CHARS}]`,
  'g',
);

const validateName = (value: string): string => {
  // Chỉ cho phép: chữ cái (có dấu), số, khoảng trắng, và các ký tự: . , ( )
  return value.normalize('NFC').replace(NAME_ALLOWED_REGEX, '');
};

const validateDescription = (value: string): string => {
  // Chỉ cho phép: chữ cái (có dấu), số, khoảng trắng, xuống dòng, và các ký tự: . , ( )
  return value.normalize('NFC').replace(NAME_ALLOWED_REGEX, '');
};

const validateText = (value: string): string => {
  // Text thông thường: chặn ký tự nguy hiểm
  return value.replace(/[<>"']/g, '');
};

const validateURL = (value: string): string => {
  // URL: chặn các ký tự nguy hiểm
  return value.replace(/[<>"']/g, '');
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading, error } = useProducts(currentPage, 50, searchTerm);

  // Fetch all categories to map categoryId to category name
  const { data: categoriesData } = useCategories(1, 1000);

  // Fetch all materials to map materialId to material name
  const { data: materialsData } = useMaterials(1, 1000);

  // Fetch all packaging types to map packagingTypeId to packaging type name
  const { data: packagingTypesData } = usePackagingTypes(1, 1000);

  // Debug: Log categories data structure
  React.useEffect(() => {
    if (categoriesData) {
      console.log('🔍 Categories Data Structure:', {
        type: typeof categoriesData,
        isArray: Array.isArray(categoriesData),
        keys: Object.keys(categoriesData),
        hasCategories: 'categories' in categoriesData,
        categoriesType: typeof categoriesData.categories,
        categoriesIsArray: Array.isArray(categoriesData.categories),
        categoriesLength: categoriesData.categories?.length,
        categoriesValue: categoriesData.categories,
        fullData: categoriesData
      });
    }
  }, [categoriesData]);

  // Delete product mutation
  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();

  // Create category map: categoryId -> category name
  const categoryMap = React.useMemo(() => {
    const map = new Map<number, string>();

    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      categoriesData.categories.forEach((category: any) => {
        if (category && category.id) {
          // Use name if available, otherwise use code, otherwise use displayName
          const displayName =
            (category.name && category.name.trim()) ||
            (category.code && category.code.trim()) ||
            (category.displayName && category.displayName.trim()) ||
            `Category ${category.id}`;

          map.set(Number(category.id), String(displayName));
        }
      });

      // Debug: Log map để kiểm tra
      console.log('Category Map:', Array.from(map.entries()));
    } else {
      console.warn('Categories data not available:', {
        hasCategoriesData: !!categoriesData,
        hasCategories: !!categoriesData?.categories,
        isArray: Array.isArray(categoriesData?.categories),
        categoriesLength: categoriesData?.categories?.length
      });
    }

    return map;
  }, [categoriesData]);

  // Create material map: materialId -> material displayName
  const materialMap = React.useMemo(() => {
    const map = new Map<number, string>();

    if (materialsData?.materials && Array.isArray(materialsData.materials)) {
      materialsData.materials.forEach((material: any) => {
        if (material && material.id) {
          // Use displayName if available, otherwise use name
          const displayName =
            (material.displayName && material.displayName.trim()) ||
            (material.name && material.name.trim()) ||
            `Material ${material.id}`;

          map.set(Number(material.id), String(displayName));
        }
      });
    }

    return map;
  }, [materialsData]);

  // Create packaging type map: packagingTypeId -> packaging type name
  const packagingTypeMap = React.useMemo(() => {
    const map = new Map<number, string>();

    if (packagingTypesData?.packagingTypes && Array.isArray(packagingTypesData.packagingTypes)) {
      packagingTypesData.packagingTypes.forEach((packaging: any) => {
        if (packaging && packaging.id) {
          // Use name if available, otherwise use code
          const displayName =
            (packaging.name && packaging.name.trim()) ||
            (packaging.code && packaging.code.trim()) ||
            `Packaging ${packaging.id}`;

          map.set(Number(packaging.id), String(displayName));
        }
      });
    }

    return map;
  }, [packagingTypesData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
      deleteProductMutation.mutate(productId, {
        onSuccess: () => {
          toast.success('Xóa sản phẩm thành công');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại');
        },
      });
    }
  };

  const handleEditProduct = (product: ProductResponse) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Filter products based on search, status, and category
  const filteredProducts = productsData?.products?.filter((product: ProductResponse) => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && product.isActive) ||
      (selectedStatus === 'inactive' && !product.isActive);

    const matchesCategory = selectedCategory === 'all' ||
      product.categoryId.toString() === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  // Calculate summary statistics
  const totalProducts = productsData?.total || 0;
  const activeProducts = productsData?.products?.filter((p: ProductResponse) => p.isActive).length || 0;
  const inStockProducts = productsData?.products?.filter((p: ProductResponse) => p.stockStatus === 'IN_STOCK').length || 0;

  // Get unique categories from categories API for filter dropdown
  const categories = React.useMemo(() => {
    if (categoriesData?.categories && categoriesData.categories.length > 0) {
      return categoriesData.categories.map((c: any) => ({
        id: c.id,
        name: c.name || c.code || `Category ${c.id}`
      }));
    }
    return [];
  }, [categoriesData]);

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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="mt-2 text-gray-600">
            Quản lý sản phẩm trong hệ thống
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin sản phẩm để tạo mới
              </DialogDescription>
            </DialogHeader>
            <CreateProductForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Còn hàng</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm còn hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm sản phẩm và lọc theo trạng thái, danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, SKU, thương hiệu, model..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category: { id: number; name: string }) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            {filteredProducts.length} sản phẩm được tìm thấy
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
                      <TableHead className="w-[22%]">Sản phẩm</TableHead>
                      <TableHead className="w-[10%]">SKU</TableHead>
                      <TableHead className="w-[12%]">Danh mục</TableHead>
                      <TableHead className="w-[10%]">Thương hiệu</TableHead>
                      <TableHead className="w-[10%]">Formula Product</TableHead>
                      <TableHead className="w-[10%]">Trạng thái</TableHead>
                      <TableHead className="w-[10%]">Tồn kho</TableHead>
                      <TableHead className="w-[12%]">Quản lí theo Lô/HSD</TableHead>
                      <TableHead className="w-[8%]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: ProductResponse) => (
                      <TableRow key={product.id}>
                        <TableCell className="truncate">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate text-sm">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-gray-500 truncate">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="truncate">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs truncate inline-block max-w-full">
                            {product.sku}
                          </code>
                        </TableCell>
                        <TableCell className="truncate">
                          <Badge variant="outline" className="truncate max-w-full inline-block">
                            {(() => {
                              // Get category name from categoryMap using categoryId
                              const categoryId = Number(product.categoryId);
                              const categoryName = categoryMap.get(categoryId);

                              if (categoryName) {
                                return categoryName;
                              }

                              // Fallback: Use product.category object if available
                              if (product.category?.name) return product.category.name;
                              if (product.category?.displayName) return product.category.displayName;

                              // Last resort: show ID
                              return `Danh mục ${product.categoryId}`;
                            })()}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate">
                          <span className="text-sm truncate">{product.brand || 'N/A'}</span>
                        </TableCell>
                        <TableCell className="truncate">
                          <span className="text-sm truncate">{product.model || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs whitespace-nowrap">
                            {product.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {product.stockStatus === 'IN_STOCK' && <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />}
                            {product.stockStatus === 'LOW_STOCK' && <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />}
                            {product.stockStatus === 'OUT_OF_STOCK' && <TrendingDown className="h-3 w-3 text-red-600 flex-shrink-0" />}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${product.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                              product.stockStatus === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {product.stockStatus === 'IN_STOCK' ? 'Còn hàng' :
                                product.stockStatus === 'LOW_STOCK' ? 'Sắp hết' : 'Hết hàng'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Switch
                              checked={product.isBatchManaged || false}
                              onCheckedChange={(checked: boolean) => {
                                updateProductMutation.mutate({
                                  id: product.id,
                                  data: {
                                    isBatchManaged: checked,
                                    hasExpiryDate: checked,
                                    batchRequired: checked,
                                  }
                                }, {
                                  onSuccess: () => {
                                    toast.success('Cập nhật quản lý theo Lô/HSD thành công');
                                  },
                                  onError: (error: any) => {
                                    toast.error(error.response?.data?.message || 'Cập nhật thất bại');
                                  }
                                });
                              }}
                              disabled={updateProductMutation.isPending}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Xem chi tiết"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Chỉnh sửa"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Xóa"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                </div>
              )}

              {/* Pagination */}
              {productsData && productsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * 50) + 1} đến {Math.min(currentPage * 50, productsData.total)} trong tổng số {productsData.total} kết quả
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
                      Trang {currentPage} / {productsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev: number) => Math.min(productsData.totalPages, prev + 1))}
                      disabled={currentPage === productsData.totalPages}
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

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết sản phẩm</DialogTitle>
              <DialogDescription>
                Thông tin đầy đủ về sản phẩm {selectedProduct.name}
              </DialogDescription>
            </DialogHeader>
            <ProductDetailView product={selectedProduct} categoryMap={categoryMap} materialMap={materialMap} packagingTypeMap={packagingTypeMap} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setEditingProduct(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin sản phẩm {editingProduct.name}
              </DialogDescription>
            </DialogHeader>
            <EditProductForm
              product={editingProduct}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Product Form Component
function CreateProductForm({ onSuccess }: { onSuccess: () => void }) {
  // Fetch data for dropdowns
  const { data: categoriesData } = useCategories(1, 1000);
  const { data: materialsData } = useMaterials(1, 1000);
  const { data: brandsData } = useBrands(1, 1000);
  const { data: unitsData } = useUnits(1, 1000);
  const { data: modelsData } = useFormulaProducts(1, 1000);
  const { data: packagingTypesData } = usePackagingTypes(1, 1000);

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: 0,
    materialId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    modelId: undefined as number | undefined,
    unitId: undefined as number | undefined,
    packagingTypeId: undefined as number | undefined,
    packaging: '',
    weight: 0,
    // status: 'ACTIVE',
    isActive: true,
    imageUrl: '',
    images: '',
    // sortOrder: 0,
    isBatchManaged: false,
    hasExpiryDate: false,
    expiryWarningDays: 30,
    batchRequired: false,
    stockStatus: 'IN_STOCK',
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

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/products', data),
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo sản phẩm thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate required fields
    if (formData.isBatchManaged && !formData.expiryWarningDays) {
      toast.error('Vui lòng nhập số ngày cảnh báo hết hạn khi bật quản lý theo Lô/HSD');
      return;
    }

    // Clean up undefined values
    const cleanData: any = { ...formData };
    if (cleanData.materialId === undefined) delete cleanData.materialId;
    if (cleanData.packagingTypeId === undefined) delete cleanData.packagingTypeId;
    if (cleanData.brandId === undefined) delete cleanData.brandId;
    if (cleanData.modelId === undefined) delete cleanData.modelId;
    if (cleanData.unitId === undefined) delete cleanData.unitId;
    if (!cleanData.packaging) delete cleanData.packaging;
    if (!cleanData.description) delete cleanData.description;
    if (!cleanData.imageUrl) delete cleanData.imageUrl;
    if (!cleanData.images) delete cleanData.images;
    createProductMutation.mutate(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">SKU *</label>
            <Input
              value={formData.sku}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const rawValue = e.target.value;
                const value = validateSKU(rawValue);
                setFormData({ ...formData, sku: value });
                setFieldError(
                  'sku',
                  rawValue !== value,
                  'SKU chỉ cho phép chữ, số, gạch ngang (-) và gạch dưới (_).',
                );
              }}
              required
            />
            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Tên sản phẩm *</label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const rawValue = e.target.value;
                const value = validateName(rawValue);
                setFormData({ ...formData, name: value });
                setFieldError(
                  'name',
                  rawValue !== value,
                  'Tên sản phẩm chỉ cho phép chữ, số, khoảng trắng và các ký tự .,()',
                );
              }}
              required
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        </div>
      </div>

      <Separator />

      {/* Category & Material */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Phân loại
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Danh mục *</label>
            <Select
              value={formData.categoryId.toString()}
              onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name || category.code || `Category ${category.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Chất liệu</label>
            <Select
              value={formData.materialId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, materialId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chất liệu" />
              </SelectTrigger>
              <SelectContent>
                {materialsData?.materials?.map((material: any) => (
                  <SelectItem key={material.id} value={material.id.toString()}>
                    {material.displayName || material.name || `Material ${material.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brand & Formula Product */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Thương hiệu & Formula Product
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Thương hiệu</label>
            <Select
              value={formData.brandId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, brandId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                {brandsData?.brands?.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name || brand.code || `Brand ${brand.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Formula Product</label>
            <Select
              value={formData.modelId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, modelId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn formula product" />
              </SelectTrigger>
              <SelectContent>
                {modelsData?.models?.map((model: any) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name || model.code || `Formula Product ${model.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Packaging & Weight */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Box className="h-5 w-5 mr-2" />
          Đóng gói & Trọng lượng
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Đơn vị</label>
            <Select
              value={formData.unitId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, unitId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent>
                {unitsData?.units?.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name || unit.code || `Unit ${unit.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Loại đóng gói</label>
            <Select
              value={formData.packagingTypeId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, packagingTypeId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại đóng gói" />
              </SelectTrigger>
              <SelectContent>
                {packagingTypesData?.packagingTypes?.map((packaging: any) => (
                  <SelectItem key={packaging.id} value={packaging.id.toString()}>
                    {packaging.name || packaging.code || `Packaging ${packaging.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Trọng lượng (kg)</label>
            <Input
              type="number"
              min="0"                     // ngăn nhập số âm ở mức HTML
              step="0.01"                 // cho phép 2 chữ số thập phân
              value={formData.weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                // Nếu để trống → 0, nếu âm → 0, còn lại parseFloat
                const val = raw === '' ? 0 : parseFloat(raw);
                setFormData({
                  ...formData,
                  weight: (isNaN(val) || val < 0) ? 0 : val,
                });
              }}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Status & Stock */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PackageCheck className="h-5 w-5 mr-2" />
          Trạng thái & Tồn kho
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div>
            <label className="text-sm font-medium">Trạng thái tồn kho</label>
            <Select
              value={formData.stockStatus}
              onValueChange={(value) => setFormData({ ...formData, stockStatus: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">Còn hàng</SelectItem>
                <SelectItem value="LOW_STOCK">Sắp hết</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <label className="text-sm font-medium">Đang hoạt động</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Batch Management */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Quản lý theo Lô/HSD
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isBatchManaged}
              onCheckedChange={(checked) => setFormData({ ...formData, isBatchManaged: checked, hasExpiryDate: checked, batchRequired: checked })}
            />
            <label className="text-sm font-medium">Quản lý theo batch</label>
          </div>
          {formData.isBatchManaged && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.hasExpiryDate}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasExpiryDate: checked })}
                />
                <label className="text-sm font-medium">Có hạn sử dụng</label>
              </div>
              <div>
                <label className="text-sm font-medium">Cảnh báo hết hạn (ngày) *</label>
                <Input
                  type="number"
                  value={formData.expiryWarningDays}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expiryWarningDays: parseInt(e.target.value) || 30 })}
                  required
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.batchRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, batchRequired: checked })}
                />
                <label className="text-sm font-medium">Bắt buộc nhập số lô</label>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Images */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Hình ảnh
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">URL ảnh chính</label>
            <Input
              value={formData.imageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = validateURL(e.target.value);
                setFormData({ ...formData, imageUrl: value });
              }}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Danh sách ảnh (phân cách bằng dấu phẩy)</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={2}
              value={formData.images}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = validateURL(e.target.value);
                setFormData({ ...formData, images: value });
              }}
              placeholder="url1, url2, url3"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Info */}
      {/* <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Thông tin bổ sung
        </h3>
        <div>
          <label className="text-sm font-medium">Thứ tự sắp xếp</label>
          <Input
            type="number"
            value={formData.sortOrder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div> */}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Hủy
        </Button>
        <Button type="submit" disabled={createProductMutation.isPending}>
          {createProductMutation.isPending ? 'Đang tạo...' : 'Tạo sản phẩm'}
        </Button>
      </div>
    </form>
  );
}

// Edit Product Form Component
function EditProductForm({ product, onSuccess }: { product: ProductResponse; onSuccess: () => void }) {
  // Fetch data for dropdowns
  const { data: categoriesData } = useCategories(1, 1000);
  const { data: materialsData } = useMaterials(1, 1000);
  const { data: brandsData } = useBrands(1, 1000);
  const { data: unitsData } = useUnits(1, 1000);
  const { data: modelsData } = useFormulaProducts(1, 1000);
  const { data: packagingTypesData } = usePackagingTypes(1, 1000);

  const queryClient = useQueryClient();
  const updateProductMutation = useUpdateProduct();

  const [formData, setFormData] = useState({
    sku: product.sku || '',
    name: product.name || '',
    description: product.description || '',
    categoryId: product.categoryId || 0,
    materialId: product.materialId,
    brandId: product.brandId,
    modelId: product.modelId,
    unitId: product.unitId,
    packagingTypeId: product.packagingTypeId,
    packaging: product.packaging || '',
    weight: product.weight || 0,
    // status: product.status || 'ACTIVE',
    isActive: product.isActive ?? true,
    imageUrl: product.imageUrl || '',
    images: product.images || '',
    // sortOrder: product.sortOrder || 0,
    isBatchManaged: product.isBatchManaged || false,
    hasExpiryDate: product.hasExpiryDate || false,
    expiryWarningDays: product.expiryWarningDays || 30,
    batchRequired: product.batchRequired || false,
    stockStatus: product.stockStatus || 'IN_STOCK',
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

  // Map brand string to brandId when brands data is loaded
  useEffect(() => {
    if (!product.brandId && product.brand && brandsData?.brands) {
      const brand = brandsData.brands.find(
        (b: any) => b.name === product.brand || b.code === product.brand
      );
      if (brand?.id) {
        setFormData(prev => ({ ...prev, brandId: brand.id }));
      }
    }
  }, [product.brand, product.brandId, brandsData]);

  // Map model string to modelId when models data is loaded
  useEffect(() => {
    if (!product.modelId && product.model && modelsData?.models) {
      const model = modelsData.models.find(
        (m: any) => m.name === product.model || m.code === product.model
      );
      if (model?.id) {
        setFormData(prev => ({ ...prev, modelId: model.id }));
      }
    }
  }, [product.model, product.modelId, modelsData]);

  // Map unit string to unitId when units data is loaded
  useEffect(() => {
    if (!product.unitId && product.unit && unitsData?.units) {
      const unit = unitsData.units.find(
        (u: any) => u.name === product.unit || u.code === product.unit || u.symbol === product.unit
      );
      if (unit?.id) {
        setFormData(prev => ({ ...prev, unitId: unit.id }));
      }
    }
  }, [product.unit, product.unitId, unitsData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate required fields
    if (formData.isBatchManaged && !formData.expiryWarningDays) {
      toast.error('Vui lòng nhập số ngày cảnh báo hết hạn khi bật quản lý theo Lô/HSD');
      return;
    }

    // Clean up undefined values
    const cleanData: any = { ...formData };
    // Remove SKU from update data - SKU should not be changed
    delete cleanData.sku;
    if (cleanData.materialId === undefined) delete cleanData.materialId;
    if (cleanData.packagingTypeId === undefined) delete cleanData.packagingTypeId;
    if (cleanData.brandId === undefined) delete cleanData.brandId;
    if (cleanData.modelId === undefined) delete cleanData.modelId;
    if (cleanData.unitId === undefined) delete cleanData.unitId;
    if (!cleanData.packaging) delete cleanData.packaging;
    // Always include description (even if empty string) so it can be cleared in database
    cleanData.description = cleanData.description || '';
    if (!cleanData.imageUrl) delete cleanData.imageUrl;
    if (!cleanData.images) delete cleanData.images;

    updateProductMutation.mutate(
      { id: product.id, data: cleanData },
      {
        onSuccess: () => {
          toast.success('Cập nhật sản phẩm thành công');
          queryClient.invalidateQueries({ queryKey: ['products'] });
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">SKU *</label>
            <Input
              value={formData.sku}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tên sản phẩm *</label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const rawValue = e.target.value;
                const value = validateName(rawValue);
                setFormData({ ...formData, name: value });
                setFieldError(
                  'name',
                  rawValue !== value,
                  'Tên sản phẩm chỉ cho phép chữ, số, khoảng trắng và các ký tự .,()',
                );
              }}
              required
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        </div>
      </div>

      <Separator />

      {/* Category & Material */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Phân loại
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Danh mục *</label>
            <Select
              value={formData.categoryId.toString()}
              onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name || category.code || `Category ${category.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Chất liệu</label>
            <Select
              value={formData.materialId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, materialId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chất liệu" />
              </SelectTrigger>
              <SelectContent>
                {materialsData?.materials?.map((material: any) => (
                  <SelectItem key={material.id} value={material.id.toString()}>
                    {material.displayName || material.name || `Material ${material.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brand & Formula Product */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Thương hiệu & Formula Product
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Thương hiệu</label>
            <Select
              value={formData.brandId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, brandId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                {brandsData?.brands?.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name || brand.code || `Brand ${brand.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Formula Product</label>
            <Select
              value={formData.modelId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, modelId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn formula product" />
              </SelectTrigger>
              <SelectContent>
                {modelsData?.models?.map((model: any) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name || model.code || `Formula Product ${model.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Packaging & Weight */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Box className="h-5 w-5 mr-2" />
          Đóng gói & Trọng lượng
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Đơn vị</label>
            <Select
              value={formData.unitId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, unitId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitsData?.units?.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name || unit.code || `Unit ${unit.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Loại đóng gói</label>
            <Select
              value={formData.packagingTypeId?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, packagingTypeId: value ? parseInt(value) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại đóng gói" />
              </SelectTrigger>
              <SelectContent>
                {packagingTypesData?.packagingTypes?.map((packaging: any) => (
                  <SelectItem key={packaging.id} value={packaging.id.toString()}>
                    {packaging.name || packaging.code || `Packaging ${packaging.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Trọng lượng (kg)</label>
            <Input
              type="number"
              min="0"                     // ngăn nhập số âm ở mức HTML
              step="0.01"                 // cho phép 2 chữ số thập phân
              value={formData.weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                // Nếu để trống → 0, nếu âm → 0, còn lại parseFloat
                const val = raw === '' ? 0 : parseFloat(raw);
                setFormData({
                  ...formData,
                  weight: (isNaN(val) || val < 0) ? 0 : val,
                });
              }}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Status & Stock */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PackageCheck className="h-5 w-5 mr-2" />
          Trạng thái & Tồn kho
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div>
            <label className="text-sm font-medium">Trạng thái tồn kho</label>
            <Select
              value={formData.stockStatus}
              onValueChange={(value) => setFormData({ ...formData, stockStatus: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">Còn hàng</SelectItem>
                <SelectItem value="LOW_STOCK">Sắp hết</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <label className="text-sm font-medium">Đang hoạt động</label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Batch Management */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Quản lý theo Lô/HSD
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isBatchManaged}
              onCheckedChange={(checked) => setFormData({ ...formData, isBatchManaged: checked, hasExpiryDate: checked, batchRequired: checked })}
            />
            <label className="text-sm font-medium">Quản lý theo batch</label>
          </div>
          {formData.isBatchManaged && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.hasExpiryDate}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasExpiryDate: checked })}
                />
                <label className="text-sm font-medium">Có hạn sử dụng</label>
              </div>
              <div>
                <label className="text-sm font-medium">Cảnh báo hết hạn (ngày) *</label>
                <Input
                  type="number"
                  value={formData.expiryWarningDays}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expiryWarningDays: parseInt(e.target.value) || 30 })}
                  required
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.batchRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, batchRequired: checked })}
                />
                <label className="text-sm font-medium">Bắt buộc nhập số lô</label>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Images */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Hình ảnh
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">URL ảnh chính</label>
            <Input
              value={formData.imageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = validateURL(e.target.value);
                setFormData({ ...formData, imageUrl: value });
              }}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Danh sách ảnh (phân cách bằng dấu phẩy)</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={2}
              value={formData.images}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = validateURL(e.target.value);
                setFormData({ ...formData, images: value });
              }}
              placeholder="url1, url2, url3"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Info */}
      {/* <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Thông tin bổ sung
        </h3>
        <div>
          <label className="text-sm font-medium">Thứ tự sắp xếp</label>
          <Input
            type="number"
            value={formData.sortOrder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div> */}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Hủy
        </Button>
        <Button type="submit" disabled={updateProductMutation.isPending}>
          {updateProductMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
        </Button>
      </div>
    </form>
  );
}

// Product Detail View Component - Hiển thị tất cả các field
function ProductDetailView({ product, categoryMap, materialMap, packagingTypeMap }: { product: ProductResponse; categoryMap: Map<number, string>; materialMap: Map<number, string>; packagingTypeMap: Map<number, string> }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-sm font-semibold">{product.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">SKU</label>
            <p className="text-sm font-semibold">{product.sku}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-500">Tên sản phẩm</label>
            <p className="text-sm font-semibold">{product.name}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-500">Mô tả</label>
            <p className="text-sm">{product.description || 'Không có mô tả'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Category & Material */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Phân loại
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Danh mục</label>
            <div className="mt-1">
              <Badge variant="outline">
                <span className="text-sm">
                  {(() => {
                    // Get category name from categoryMap using categoryId
                    const categoryId = Number(product.categoryId);
                    const categoryName = categoryMap.get(categoryId);

                    if (categoryName) {
                      return categoryName;
                    }

                    // Fallback: Use product.category object if available
                    if (product.category?.name) return product.category.name;
                    if (product.category?.displayName) return product.category.displayName;

                    // Last resort: show ID
                    return `Danh mục ${product.categoryId}`;
                  })()}
                </span>
              </Badge>
              <p className="text-xs text-gray-400 mt-1">ID: {product.categoryId}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Chất liệu</label>
            <div className="mt-1">
              {product.material ? (
                <>
                  <Badge variant="outline">
                    <span className="text-sm">{product.material.name || product.material.displayName || `Material ${product.material.id}`}</span>
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">ID: {product.material.id}</p>
                </>
              ) : product.materialId ? (
                <>
                  <Badge variant="outline">
                    <span className="text-sm">
                      {materialMap.get(product.materialId) || `Material ID: ${product.materialId}`}
                    </span>
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">ID: {product.materialId}</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Không có</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brand & Formula Product */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Thương hiệu & Formula Product
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Thương hiệu</label>
            <p className="text-sm">{product.brand || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Formula Product</label>
            <p className="text-sm">{product.model || 'N/A'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Packaging & Weight */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Box className="h-5 w-5 mr-2" />
          Đóng gói & Trọng lượng
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Đơn vị</label>
            <p className="text-sm">{product.unit || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Trọng lượng</label>
            <div className="flex items-center space-x-2">
              <Weight className="h-4 w-4 text-gray-400" />
              <p className="text-sm">{product.weight || 0} kg</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Loại đóng gói</label>
            <div className="mt-1">
              {product.packagingTypeId ? (
                <>
                  <Badge variant="outline">
                    <span className="text-sm">
                      {packagingTypeMap.get(product.packagingTypeId) || `Packaging ${product.packagingTypeId}`}
                    </span>
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">ID: {product.packagingTypeId}</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Không có</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Đóng gói</label>
            <p className="text-sm">{product.packaging || 'N/A'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Status & Stock */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PackageCheck className="h-5 w-5 mr-2" />
          Trạng thái & Tồn kho
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Trạng thái</label>
            <div className="mt-1">
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </Badge>
              <p className="text-xs text-gray-400 mt-1">Status: {product.status}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tồn kho</label>
            <div className="mt-1 flex items-center space-x-2">
              {product.stockStatus === 'IN_STOCK' && <TrendingUp className="h-4 w-4 text-green-600" />}
              {product.stockStatus === 'LOW_STOCK' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              {product.stockStatus === 'OUT_OF_STOCK' && <TrendingDown className="h-4 w-4 text-red-600" />}
              <Badge className={
                product.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                  product.stockStatus === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
              }>
                {product.stockStatus === 'IN_STOCK' ? 'Còn hàng' :
                  product.stockStatus === 'LOW_STOCK' ? 'Sắp hết' : 'Hết hàng'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Batch Management */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Quản lý theo Lô/HSD
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            {product.isBatchManaged ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <label className="text-sm font-medium">Quản lý theo batch</label>
              <p className="text-xs text-gray-400">{product.isBatchManaged ? 'Có' : 'Không'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {product.hasExpiryDate ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <label className="text-sm font-medium">Có hạn sử dụng</label>
              <p className="text-xs text-gray-400">{product.hasExpiryDate ? 'Có' : 'Không'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {product.batchRequired ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <label className="text-sm font-medium">Bắt buộc batch</label>
              <p className="text-xs text-gray-400">{product.batchRequired ? 'Có' : 'Không'}</p>
            </div>
          </div>
          {product.hasExpiryDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Cảnh báo hết hạn (ngày)</label>
              <p className="text-sm">{product.expiryWarningDays || 30} ngày</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Images */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Hình ảnh
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Ảnh chính</label>
            {product.imageUrl ? (
              <div className="mt-2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <p className="text-xs text-gray-400 mt-1 truncate">{product.imageUrl}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">Không có ảnh</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Danh sách ảnh</label>
            {product.images ? (
              <p className="text-sm mt-2 break-all">{product.images}</p>
            ) : (
              <p className="text-sm text-gray-400 mt-2">Không có ảnh</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Thông tin bổ sung
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Thứ tự sắp xếp</label>
            <p className="text-sm">{product.sortOrder || 0}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Category ID</label>
            <p className="text-sm">{product.categoryId}</p>
          </div>
          {product.materialId && (
            <div>
              <label className="text-sm font-medium text-gray-500">Material ID</label>
              <p className="text-sm">{product.materialId}</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Timestamps */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Thời gian
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
            <p className="text-sm">{formatDate(product.createdAt)}</p>
            <p className="text-xs text-gray-400">Bởi user ID: {product.createdBy}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
            <p className="text-sm">{formatDate(product.updatedAt)}</p>
            <p className="text-xs text-gray-400">Bởi user ID: {product.updatedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
