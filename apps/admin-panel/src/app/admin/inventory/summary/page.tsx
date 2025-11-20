'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Package, AlertTriangle, Eye, 
  TrendingUp, Clock, Calendar, FileText
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
import { Badge } from '@/components/ui/badge';
import { useInventorySummary, InventorySummaryItem } from '@/hooks/use-inventory-summary';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useCategories } from '@/hooks/use-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

export default function InventorySummaryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<{productId: number, productName: string} | null>(null);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const limit = 50;

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => apiClient.get('/api/warehouses?page=1&limit=1000'),
  });

  // Fetch categories
  const { data: categoriesData } = useCategories(1, 1000);

  // Build query for inventory summary
  const query = {
    search: searchTerm || undefined,
    warehouseId: selectedWarehouse !== 'all' ? parseInt(selectedWarehouse) : undefined,
    categoryId: selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
    page: currentPage,
    limit,
  };

  const { data: summaryData, isLoading, error } = useInventorySummary(query);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Get warehouses for filter
  const warehouses = warehousesData?.warehouses || [];

  // Get categories for filter
  const categories = React.useMemo(() => {
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
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

  const statistics = summaryData?.statistics || {
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
  };

  const items = summaryData?.items || [];
  const total = summaryData?.total || 0;
  const totalPages = summaryData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Tồn kho Tổng hợp</h1>
          <p className="mt-2 text-gray-600">
            Tổng hợp thông tin tồn kho theo sản phẩm
          </p>
        </div>
      </div>

      {/* Section 1: Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm tồn kho</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm có tồn kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Đơn hàng đang chờ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm dưới mức an toàn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Cần nhập thêm hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hàng hóa sắp hết hạn</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.expiringProducts}</div>
            <p className="text-xs text-muted-foreground">
              Trong 30 ngày tới
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc theo kho, danh mục sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo Mã SP, Tên SP"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kho</SelectItem>
                  {warehouses.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
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

      {/* Section 3: Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bảng thông tin Tồn kho theo Sản Phẩm</CardTitle>
          <CardDescription>
            {total} sản phẩm được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã SP / Tên SP</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead className="text-right">Tồn kho thực tế</TableHead>
                      <TableHead className="text-right">Kho Ảo (Hàng B2B)</TableHead>
                      <TableHead className="text-right">Hàng Cho Mượn</TableHead>
                      <TableHead className="text-right">Hàng Mượn Về</TableHead>
                      <TableHead className="text-right">Tổng Tồn (Sở hữu)</TableHead>
                      <TableHead className="text-center">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: InventorySummaryItem) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.productSku}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right font-medium">
                          {(item.quantityOnHand ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(item.virtualWarehouse ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          {item.onLoanOut.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {item.onLoanIn.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {item.totalOwned.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title=View
                            onClick={() => {
                              setSelectedProductForDetail({
                                productId: item.productId,
                                productName: item.productName
                              });
                              setIsWarehouseDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {items.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy dữ liệu tồn kho</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * limit) + 1} đến {Math.min(currentPage * limit, total)} trong tổng số {total} kết quả
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
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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

      {/* Warehouse Selection Dialog */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn kho để xem chi tiết</DialogTitle>
            <DialogDescription>
              Chọn kho để xem chi tiết tồn kho của sản phẩm: {selectedProductForDetail?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {warehouses.map((warehouse: any) => (
              <Button
                key={warehouse.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (selectedProductForDetail) {
                    router.push(`/admin/inventory/summary/${selectedProductForDetail.productId}/${warehouse.id}`);
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {warehouse.name} ({warehouse.code})
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

