'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Warehouse, TrendingUp, TrendingDown, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';

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
import { useInventorySummary } from '@/hooks/use-inventory-summary';
import apiClient from '@/lib/api';

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => apiClient.get('/api/warehouses?page=1&limit=1000'),
  });

  // Build query for inventory summary
  const query = {
    search: searchTerm || undefined,
    warehouseId: selectedWarehouse !== 'all' ? parseInt(selectedWarehouse) : undefined,
    page: currentPage,
    limit,
  };

  // Fetch inventory summary data
  const { data: summaryData, isLoading, error } = useInventorySummary(query);

  // Get warehouses for filter
  const warehouses = warehousesData?.warehouses || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Get statistics from API
  const statistics = summaryData?.statistics || {
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tồn kho</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi tình trạng tồn kho sản phẩm
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng chờ</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Đơn hàng đang chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm sắp hết hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.expiringProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm sắp hết hạn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm sản phẩm và chọn kho để xem tồn kho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={selectedWarehouse} onValueChange={(value) => {
                setSelectedWarehouse(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center space-x-2">
                      <Warehouse className="h-4 w-4" />
                      <span>Tất cả kho</span>
                    </div>
                  </SelectItem>
                  {warehouses.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Warehouse className="h-4 w-4" />
                        <span>{warehouse.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tồn kho sản phẩm</CardTitle>
          <CardDescription>
            Chi tiết tồn kho theo từng sản phẩm
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
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Tồn kho thực tế</TableHead>
                    <TableHead>Đã đặt</TableHead>
                    <TableHead>Có thể bán</TableHead>
                    <TableHead>Hàng Cho Mượn</TableHead>
                    <TableHead>Hàng Mượn Về</TableHead>
                    <TableHead>Tổng Tồn (Sở hữu)</TableHead>
                    <TableHead>Tình trạng tồn kho</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!summaryData?.items || summaryData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        Không có dữ liệu tồn kho
                      </TableCell>
                    </TableRow>
                  ) : (
                    summaryData.items.map((item) => {
                      // Find warehouse ID for detail link - use warehouseId from item, or fallback
                      const warehouseId = item.warehouseId 
                        || (selectedWarehouse !== 'all' ? parseInt(selectedWarehouse) : null)
                        || (warehouses.length > 0 ? warehouses[0].id : null)
                        || 1;

                      // Calculate stock status
                      const quantityOnHand = item.quantityOnHand ?? 0;
                      const virtualWarehouse = item.virtualWarehouse ?? 0;
                      const onLoanOut = item.onLoanOut ?? 0;
                      const onLoanIn = item.onLoanIn ?? 0;
                      const totalOwned = item.totalOwned ?? 0;
                      const availableStock = totalOwned - onLoanOut;
                      const getStockStatus = () => {
                        if (availableStock <= 0) {
                          return { status: 'OUT_OF_STOCK', text: 'Hết hàng', icon: TrendingDown, color: 'bg-red-100 text-red-800', iconColor: 'text-red-600' };
                        } else if (availableStock <= 10) {
                          return { status: 'LOW_STOCK', text: 'Sắp hết', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-600' };
                        } else {
                          return { status: 'IN_STOCK', text: 'Còn hàng', icon: TrendingUp, color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' };
                        }
                      };
                      const stockStatus = getStockStatus();
                      const StatusIcon = stockStatus.icon;

                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                {item.categoryName && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.categoryName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {item.productSku}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {item.quantityOnHand ?? 0}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.unit || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-orange-600 font-medium">
                              {item.virtualWarehouse ?? 0}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.unit || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 font-semibold">
                              {availableStock}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.unit || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-blue-600">
                              {onLoanOut}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.unit || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-purple-600">
                              {item.onLoanIn ?? 0}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.unit || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              {totalOwned}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.unit || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${stockStatus.iconColor}`} />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/inventory/summary/${item.productId}/${warehouseId}`}
                              className="inline-flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                              title="View"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination Footer */}
              {summaryData && summaryData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * limit) + 1} đến {Math.min(currentPage * limit, summaryData.total)} trong tổng số {summaryData.total} kết quả
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {summaryData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(summaryData.totalPages, prev + 1))}
                      disabled={currentPage === summaryData.totalPages}
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

      {/* Low Stock Alert */}
      {statistics.lowStockProducts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Cảnh báo sắp hết hàng</span>
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Có {statistics.lowStockProducts} sản phẩm sắp hết hàng, cần đặt hàng bổ sung
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
