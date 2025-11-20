'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, Package, AlertTriangle, Eye, 
  TrendingUp, Clock, Calendar, FileText,
  ArrowLeft, MapPin
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
import { Badge } from '@/components/ui/badge';
import { useInventoryDetail, InventoryBatchItem } from '@/hooks/use-inventory-detail';
import { formatDateOnly } from '@/lib/utils';

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.productId as string);
  const warehouseId = parseInt(params.warehouseId as string);

  const [searchTerm, setSearchTerm] = useState('');
  const [expiryDateFrom, setExpiryDateFrom] = useState('');
  const [expiryDateTo, setExpiryDateTo] = useState('');

  const query = {
    productId,
    warehouseId,
    search: searchTerm || undefined,
    expiryDateFrom: expiryDateFrom || undefined,
    expiryDateTo: expiryDateTo || undefined,
  };

  const { data: detailData, isLoading, error } = useInventoryDetail(query);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</p>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statistics = detailData.statistics;
  const batches = detailData.batches;

  // Helper function to check if batch is expiring soon (within 2 months)
  const isExpiringSoon = (expiryDate?: Date): boolean => {
    if (!expiryDate) return false;
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    return expiryDate <= twoMonthsFromNow && expiryDate > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết Tồn kho: {detailData.productName} tại {detailData.warehouseName}
            </h1>
            <p className="mt-2 text-gray-600">
              Mã SP: {detailData.productSku} | ĐVT: {detailData.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm tại Kho</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {detailData.unit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số lô hàng</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.totalBatches}</div>
            <p className="text-xs text-muted-foreground">
              Lô hàng trong kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hàng sắp hết hạn</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.expiringBatches}</div>
            <p className="text-xs text-muted-foreground">
              Trong vòng 2 tháng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Liên quan sản phẩm này
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc theo số lô, ngày hết hạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo Số Lô"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Input
                type="date"
                placeholder="Từ ngày"
                value={expiryDateFrom}
                onChange={(e) => setExpiryDateFrom(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={expiryDateTo}
                onChange={(e) => setExpiryDateTo(e.target.value)}
              />
            </div>
            {(searchTerm || expiryDateFrom || expiryDateTo) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setExpiryDateFrom('');
                  setExpiryDateTo('');
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bảng Chi tiết Tồn kho</CardTitle>
          <CardDescription>
            {batches.length} lô hàng được tìm thấy
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
                      <TableHead>Số Lô (Lot)</TableHead>
                      <TableHead>Ngày Hết hạn</TableHead>
                      <TableHead>Ngày Nhập kho</TableHead>
                      <TableHead className="text-right">Tồn kho Lô</TableHead>
                      <TableHead>Vị trí</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch: InventoryBatchItem) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {batch.batchNumber}
                          </code>
                        </TableCell>
                        <TableCell>
                          {batch.expiryDate ? (
                            <div className="flex items-center space-x-2">
                              <span>{formatDateOnly(batch.expiryDate)}</span>
                              {isExpiringSoon(batch.expiryDate) && (
                                <Badge variant="destructive" className="text-xs">
                                  Sắp hết hạn
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDateOnly(batch.receiptDate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {batch.quantity.toLocaleString()} {detailData.unit}
                        </TableCell>
                        <TableCell>
                          {batch.locationCode || batch.areaName ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {batch.locationCode || batch.areaName || 'N/A'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {batches.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy lô hàng nào</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer: Total Quantity */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng tồn kho (Sản phẩm/Kho)</p>
              <p className="text-2xl font-bold text-primary">
                {detailData.totalQuantity.toLocaleString()} {detailData.unit}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

