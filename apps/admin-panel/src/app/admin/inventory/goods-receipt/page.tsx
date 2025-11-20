'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, Package, CheckCircle } from 'lucide-react';
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
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import apiClient from '@/lib/api';

interface GoodsReceipt {
  id: number;
  receiptNumber: string;
  warehouseId: number;
  warehouseName?: string;
  receiptDate: string;
  status: 'DRAFT' | 'PENDING' | 'VERIFIED' | 'COMPLETED' | 'CANCELLED';
  receivedBy?: string;
  verifiedBy?: string;
  notes?: string;
  totalAmount: number;
  items: GoodsReceiptItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

interface GoodsReceiptItem {
  id: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export default function GoodsReceiptPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch goods receipts
  const { data: receiptsData, isLoading, error } = useQuery({
    queryKey: ['goods-receipts', currentPage, searchTerm],
    queryFn: () => apiClient.get(`/api/inventory/goods-receipts?page=${currentPage}&limit=10&search=${searchTerm}`),
    select: (response: any) => response.data,
  });

  // Delete goods receipt mutation
  const deleteReceiptMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/inventory/goods-receipts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      toast.success('Xóa phiếu nhập kho thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa phiếu nhập kho thất bại');
    },
  });

  // Verify goods receipt mutation
  const verifyReceiptMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/api/inventory/goods-receipts/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      toast.success('Xác nhận phiếu nhập kho thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xác nhận phiếu nhập kho thất bại');
    },
  });

  const handleDeleteReceipt = (receiptId: number, receiptNumber: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập kho "${receiptNumber}"?`)) {
      deleteReceiptMutation.mutate(receiptId);
    }
  };

  const handleVerifyReceipt = (receiptId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận phiếu nhập kho này?')) {
      verifyReceiptMutation.mutate(receiptId);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
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
          <h1 className="text-3xl font-bold text-gray-900">Phiếu nhập kho</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các phiếu nhập kho hàng
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo phiếu nhập kho
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tạo phiếu nhập kho mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin phiếu nhập kho
              </DialogDescription>
            </DialogHeader>
            <CreateGoodsReceiptForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
          <CardDescription>
            Tìm kiếm phiếu nhập kho theo số phiếu hoặc ghi chú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm phiếu nhập kho..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goods receipts table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu nhập kho</CardTitle>
          <CardDescription>
            {receiptsData?.total || 0} phiếu nhập kho trong hệ thống
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
                    <TableHead>Số phiếu</TableHead>
                    <TableHead>Kho</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Người nhận</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptsData?.receipts?.map((receipt: GoodsReceipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{receipt.receiptNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {receipt.items?.length || 0} sản phẩm
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{receipt.warehouseName || `Kho ${receipt.warehouseId}`}</span>
                      </TableCell>
                      <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          receipt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          receipt.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                          receipt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          receipt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {receipt.status === 'COMPLETED' ? 'Hoàn thành' :
                           receipt.status === 'VERIFIED' ? 'Đã xác nhận' :
                           receipt.status === 'PENDING' ? 'Chờ xử lý' :
                           receipt.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {receipt.totalAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{receipt.receivedBy || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Xem chi tiết"
                            onClick={() => setSelectedReceipt(receipt)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Chỉnh sửa">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {receipt.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Xác nhận"
                              onClick={() => handleVerifyReceipt(receipt.id)}
                              disabled={verifyReceiptMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDeleteReceipt(receipt.id, receipt.receiptNumber)}
                            disabled={deleteReceiptMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Goods Receipt Detail Dialog */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Chi tiết phiếu nhập kho</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về phiếu nhập kho {selectedReceipt.receiptNumber}
              </DialogDescription>
            </DialogHeader>
            <GoodsReceiptDetailView receipt={selectedReceipt} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Goods Receipt Form Component
function CreateGoodsReceiptForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    receiptNumber: '',
    warehouseId: 1,
    receiptDate: new Date().toISOString().split('T')[0],
    receivedBy: '',
    notes: '',
    items: [] as any[],
  });

  const queryClient = useQueryClient();

  const createReceiptMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/inventory/goods-receipts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      toast.success('Tạo phiếu nhập kho thành công');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo phiếu nhập kho thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReceiptMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Số phiếu *</label>
          <Input
            value={formData.receiptNumber}
            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Kho *</label>
          <Input
            type="number"
            value={formData.warehouseId}
            onChange={(e) => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Ngày nhập *</label>
          <Input
            type="date"
            value={formData.receiptDate}
            onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Người nhận</label>
          <Input
            value={formData.receivedBy}
            onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Ghi chú</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Hủy
        </Button>
        <Button type="submit" disabled={createReceiptMutation.isPending}>
          {createReceiptMutation.isPending ? 'Đang tạo...' : 'Tạo phiếu nhập kho'}
        </Button>
      </div>
    </form>
  );
}

// Goods Receipt Detail View Component
function GoodsReceiptDetailView({ receipt }: { receipt: GoodsReceipt }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Số phiếu</label>
          <p className="text-sm">{receipt.receiptNumber}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Kho</label>
          <p className="text-sm">{receipt.warehouseName || `Kho ${receipt.warehouseId}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày nhập</label>
          <p className="text-sm">{formatDate(receipt.receiptDate)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            receipt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            receipt.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
            receipt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            receipt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {receipt.status === 'COMPLETED' ? 'Hoàn thành' :
             receipt.status === 'VERIFIED' ? 'Đã xác nhận' :
             receipt.status === 'PENDING' ? 'Chờ xử lý' :
             receipt.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Người nhận</label>
          <p className="text-sm">{receipt.receivedBy || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Người xác nhận</label>
          <p className="text-sm">{receipt.verifiedBy || 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
        <p className="text-sm font-medium">{receipt.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
      </div>

      {receipt.notes && (
        <div>
          <label className="text-sm font-medium text-gray-500">Ghi chú</label>
          <p className="text-sm">{receipt.notes}</p>
        </div>
      )}

      {/* Items Table */}
      {receipt.items && receipt.items.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-500">Chi tiết sản phẩm</label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName || `Sản phẩm ${item.productId}`}</p>
                        {item.productSku && (
                          <p className="text-sm text-muted-foreground">SKU: {item.productSku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                    <TableCell>{item.totalAmount.toLocaleString('vi-VN')} VNĐ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
          <p className="text-sm">{formatDate(receipt.createdAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
          <p className="text-sm">{formatDate(receipt.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
