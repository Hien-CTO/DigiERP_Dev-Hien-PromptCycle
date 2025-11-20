'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, ShoppingCart, CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: number;
  supplierName?: string;
  warehouse_id?: number;
  order_date: string;
  expected_delivery_date?: string;
  predicted_arrival_date?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  final_amount: number;
  notes?: string;
  payment_term?: string;
  payment_method?: string;
  port_name?: string;
  approved_at?: string;
  approved_by?: string;
  items: PurchaseOrderItem[];
  purchase_request_id?: string;
  purchase_request_number?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  importer?: {
    importer_name?: string;
    importer_phone?: string;
    importer_fax?: string;
    importer_email?: string;
  };
}

interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  notes?: string;
}

export default function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch purchase orders
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['purchase-orders', currentPage, searchTerm],
    queryFn: async () => {
      const response: any = await apiClient.get(`/api/purchase/orders?page=${currentPage}&limit=10&search=${searchTerm}`);
      console.log('🔍 Purchase Orders API Response:', response);
      
      // Handle different response structures
      let orders: PurchaseOrder[] = [];
      let total = 0;
      
      // Case 1: response is array directly
      if (Array.isArray(response)) {
        orders = response;
        total = response.length;
      }
      // Case 2: response.data is array
      else if (Array.isArray(response.data)) {
        orders = response.data;
        total = response.data.length;
      }
      // Case 3: response.data.orders exists
      else if (response.data?.orders && Array.isArray(response.data.orders)) {
        orders = response.data.orders;
        total = response.data.total || response.data.orders.length;
      }
      // Case 4: response.orders exists
      else if (response.orders && Array.isArray(response.orders)) {
        orders = response.orders;
        total = response.total || response.orders.length;
      }
      // Case 5: response.data is object with orders property
      else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          orders = response.data;
          total = response.data.length;
        } else if (response.data.orders) {
          orders = response.data.orders;
          total = response.data.total || response.data.orders.length;
        } else {
          // Single order object
          orders = [response.data];
          total = 1;
        }
      }
      // Case 6: response is object (single order)
      else if (response && typeof response === 'object' && !Array.isArray(response)) {
        orders = [response];
        total = 1;
      }

      console.log('📦 Parsed orders:', { ordersCount: orders.length, total });
      console.log('🔍 Orders with purchase_request_id:', orders.filter(o => o.purchase_request_id).map(o => ({
        order_number: o.order_number,
        purchase_request_id: o.purchase_request_id
      })));

      // Fetch purchase request numbers for orders that have purchase_request_id
      const ordersWithPR = orders.filter(o => o.purchase_request_id && !o.purchase_request_number);
      console.log('📋 Orders need to fetch PR number:', ordersWithPR.length);
      
      if (ordersWithPR.length > 0) {
        await Promise.all(
          ordersWithPR.map(async (order) => {
            try {
              console.log(`🔍 Fetching PR ${order.purchase_request_id} for order ${order.order_number}`);
              const prResponse: any = await apiClient.get(`/api/purchase/purchase-requests/${order.purchase_request_id}`);
              console.log(`📄 PR Response for ${order.purchase_request_id}:`, prResponse);
              
              // Try multiple response structures
              const requestNumber = prResponse?.request_number 
                || prResponse?.data?.request_number
                || (prResponse?.data && typeof prResponse.data === 'object' && 'request_number' in prResponse.data ? prResponse.data.request_number : null);
              
              if (requestNumber) {
                order.purchase_request_number = requestNumber;
                console.log(`✅ Set purchase_request_number for order ${order.order_number}: ${requestNumber}`);
              } else {
                console.warn(`⚠️ No request_number found in PR response for ${order.purchase_request_id}:`, prResponse);
              }
            } catch (err: any) {
              console.error(`❌ Failed to fetch PR ${order.purchase_request_id} for order ${order.order_number}:`, err);
              console.error('Error details:', err.response?.data || err.message);
            }
          })
        );
      }

      return { orders, total };
    },
  });

  const orders: PurchaseOrder[] = ordersData?.orders || ordersData || [];

  // Delete purchase order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/purchase/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Xóa đơn mua hàng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa đơn mua hàng thất bại');
    },
  });

  // Approve purchase order mutation
  const approveOrderMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/purchase/orders/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Phê duyệt đơn mua hàng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Phê duyệt đơn mua hàng thất bại');
    },
  });

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn mua hàng "${orderNumber}"?`)) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleApproveOrder = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt đơn mua hàng này?')) {
      approveOrderMutation.mutate(orderId);
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
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Đơn mua hàng</h1>
            <Link href="/admin/purchase/requests">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Yêu Cầu Mua Hàng
              </Button>
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Quản lý các đơn mua hàng từ nhà cung cấp. Có thể tạo từ Yêu Cầu Mua Hàng hoặc tạo trực tiếp.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đơn mua hàng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tạo đơn mua hàng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin đơn mua hàng
              </DialogDescription>
            </DialogHeader>
            <CreatePurchaseOrderForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
          <CardDescription>
            Tìm kiếm đơn mua hàng theo số đơn hoặc nhà cung cấp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đơn mua hàng..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase orders table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn mua hàng</CardTitle>
          <CardDescription>
            {ordersData?.total || orders.length} đơn mua hàng trong hệ thống
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
                    <TableHead>Số đơn</TableHead>
                    <TableHead>Số yêu cầu</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Ngày giao dự kiến</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: PurchaseOrder) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} sản phẩm
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.purchase_request_number ? (
                          <Link 
                            href={`/admin/purchase/requests?highlight=${order.purchase_request_id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {order.purchase_request_number}
                          </Link>
                        ) : order.purchase_request_id ? (
                          <span className="text-xs text-gray-500">Đang tải...</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{order.supplierName || `Nhà cung cấp ${order.supplier_id}`}</span>
                      </TableCell>
                      <TableCell>{formatDate(order.order_date)}</TableCell>
                      <TableCell>
                        {order.expected_delivery_date ? formatDate(order.expected_delivery_date) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                          order.status === 'APPROVED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'RECEIVED' ? 'Đã nhận' :
                           order.status === 'APPROVED' ? 'Đã phê duyệt' :
                           order.status === 'PENDING' ? 'Chờ phê duyệt' :
                           order.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {order.final_amount?.toLocaleString('vi-VN') || order.total_amount?.toLocaleString('vi-VN') || '0'} VNĐ
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.purchase_request_id ? (
                          <Link href={`/admin/purchase/requests?highlight=${order.purchase_request_id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              <ArrowLeft className="h-3 w-3 mr-1" />
                              Từ PR
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-500">Tạo trực tiếp</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Xem chi tiết"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Chỉnh sửa">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {order.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Phê duyệt"
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={approveOrderMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDeleteOrder(order.id, order.order_number)}
                            disabled={deleteOrderMutation.isPending}
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

      {/* Purchase Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn mua hàng</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đơn mua hàng {selectedOrder.order_number}
              </DialogDescription>
            </DialogHeader>
            <PurchaseOrderDetailView order={selectedOrder} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Purchase Order Form Component
function CreatePurchaseOrderForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierId: 1,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: '',
    items: [] as any[],
  });

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/purchase/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Tạo đơn mua hàng thành công');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo đơn mua hàng thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Số đơn *</label>
          <Input
            value={formData.orderNumber}
            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Nhà cung cấp *</label>
          <Input
            type="number"
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Ngày đặt *</label>
          <Input
            type="date"
            value={formData.orderDate}
            onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ngày giao dự kiến</label>
          <Input
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
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
        <Button type="submit" disabled={createOrderMutation.isPending}>
          {createOrderMutation.isPending ? 'Đang tạo...' : 'Tạo đơn mua hàng'}
        </Button>
      </div>
    </form>
  );
}

// Purchase Order Detail View Component
function PurchaseOrderDetailView({ order }: { order: PurchaseOrder }) {
  return (
    <div className="space-y-3">
      {order.purchase_request_id && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <FileText className="h-4 w-4" />
            <span>Đơn này được tạo từ Yêu Cầu Mua Hàng</span>
            <Link href={`/admin/purchase/requests?highlight=${order.purchase_request_id}`}>
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                Xem Yêu Cầu
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500">Số đơn</label>
          <p className="text-sm font-semibold">{order.order_number}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Nhà cung cấp</label>
          <p className="text-sm">{order.supplierName || `Nhà cung cấp ${order.supplier_id}`}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Ngày đặt</label>
          <p className="text-sm">{formatDate(order.order_date)}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Ngày giao dự kiến</label>
          <p className="text-sm">{order.expected_delivery_date ? formatDate(order.expected_delivery_date) : 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Ngày đến dự kiến</label>
          <p className="text-sm">{order.predicted_arrival_date ? formatDate(order.predicted_arrival_date) : 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Kho</label>
          <p className="text-sm">{order.warehouse_id ? `Kho ${order.warehouse_id}` : 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Trạng thái</label>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          order.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
          order.status === 'APPROVED' ? 'bg-purple-100 text-purple-800' :
          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status === 'RECEIVED' ? 'Đã nhận' :
           order.status === 'APPROVED' ? 'Đã phê duyệt' :
           order.status === 'PENDING' ? 'Chờ phê duyệt' :
           order.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
        </span>
      </div>

      {/* Financial Information */}
      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Thông tin tài chính</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Tổng tiền</label>
            <p className="text-sm font-medium">{order.total_amount?.toLocaleString('vi-VN') || '0'} VNĐ</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Giảm giá</label>
            <p className="text-sm">{order.discount_amount?.toLocaleString('vi-VN') || '0'} VNĐ</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Thuế</label>
            <p className="text-sm">{order.tax_amount?.toLocaleString('vi-VN') || '0'} VNĐ</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Thành tiền</label>
            <p className="text-sm font-semibold text-green-600">{order.final_amount?.toLocaleString('vi-VN') || order.total_amount?.toLocaleString('vi-VN') || '0'} VNĐ</p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {(order.payment_term || order.payment_method) && (
        <div className="border-t pt-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Thông tin thanh toán</h3>
          <div className="grid grid-cols-2 gap-3">
            {order.payment_term && (
              <div>
                <label className="text-xs font-medium text-gray-500">Điều khoản thanh toán</label>
                <p className="text-sm">{order.payment_term}</p>
              </div>
            )}
            {order.payment_method && (
              <div>
                <label className="text-xs font-medium text-gray-500">Phương thức thanh toán</label>
                <p className="text-sm">{order.payment_method}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shipping Information */}
      {order.port_name && (
        <div className="border-t pt-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Thông tin vận chuyển</h3>
          <div>
            <label className="text-xs font-medium text-gray-500">Tên cảng</label>
            <p className="text-sm">{order.port_name}</p>
          </div>
        </div>
      )}

      {/* Importer Information */}
      {order.importer && (
        (order.importer.importer_name ||
          order.importer.importer_phone ||
          order.importer.importer_fax ||
          order.importer.importer_email) && (
          <div className="border-t pt-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Thông tin Importer</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {order.importer.importer_name && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Tên:</span>{' '}
                  <span className="font-medium">{order.importer.importer_name}</span>
                </div>
              )}
              {order.importer.importer_phone && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Điện thoại:</span>{' '}
                  <span className="font-medium">{order.importer.importer_phone}</span>
                </div>
              )}
              {order.importer.importer_fax && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Fax:</span>{' '}
                  <span className="font-medium">{order.importer.importer_fax}</span>
                </div>
              )}
              {order.importer.importer_email && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Email:</span>{' '}
                  <span className="font-medium break-all">{order.importer.importer_email}</span>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {order.notes && (
        <div>
          <label className="text-xs font-medium text-gray-500">Ghi chú</label>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      {/* Items Table */}
      {order.items && order.items.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Chi tiết sản phẩm</label>
          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
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
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.product_name || item.productName || `Sản phẩm ${item.product_id || item.productId}`}</p>
                        {(item.product_sku || item.productSku) && (
                          <p className="text-sm text-muted-foreground">SKU: {item.product_sku || item.productSku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{(item.unit_cost || item.unitPrice)?.toLocaleString('vi-VN') || '0'} VNĐ</TableCell>
                    <TableCell>{(item.total_amount || item.totalAmount)?.toLocaleString('vi-VN') || '0'} VNĐ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Approval Information */}
      {(order.approved_at || order.approved_by) && (
        <div className="border-t pt-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Thông tin phê duyệt</h3>
          <div className="grid grid-cols-2 gap-3">
            {order.approved_by && (
              <div>
                <label className="text-xs font-medium text-gray-500">Người phê duyệt</label>
                <p className="text-sm">{order.approved_by}</p>
              </div>
            )}
            {order.approved_at && (
              <div>
                <label className="text-xs font-medium text-gray-500">Ngày phê duyệt</label>
                <p className="text-sm">{formatDate(order.approved_at)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Thông tin hệ thống</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Ngày tạo</label>
            <p className="text-sm">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Cập nhật lần cuối</label>
            <p className="text-sm">{formatDate(order.updated_at)}</p>
          </div>
          {order.created_by && (
            <div>
              <label className="text-xs font-medium text-gray-500">Người tạo</label>
              <p className="text-sm">User ID: {order.created_by}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
