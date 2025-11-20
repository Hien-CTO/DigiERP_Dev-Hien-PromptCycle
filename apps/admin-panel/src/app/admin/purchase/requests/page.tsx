'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
import { formatDate, formatDateOnly } from '@/lib/utils';
import apiClient from '@/lib/api';
import { useProducts } from '@/hooks/use-products';
import { ProductResponse } from '@/types/product';

interface PurchaseRequest {
  id: string;
  request_number: string;
  warehouse_id: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  request_date: string;
  required_date?: string;
  reason: string;
  notes?: string;
  requested_by: string;
  approved_by?: string;
  rejected_by?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseRequestItem[];
}

interface PurchaseRequestItem {
  id: string;
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit?: string;
  estimated_unit_cost?: number;
  notes?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING_APPROVAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Nháp';
    case 'PENDING_APPROVAL':
      return 'Chờ duyệt';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Từ chối';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};

export default function PurchaseRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const queryClient = useQueryClient();

  // Fetch purchase requests
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['purchase-requests', currentPage, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const response = await apiClient.get(`/api/purchase/purchase-requests?${params.toString()}`);
      console.log('🔍 Purchase Requests API Response:', response);
      
      // Handle different response structures
      if (response && typeof response === 'object') {
        // If response is already { data: [], total: number }
        if ('data' in response && 'total' in response) {
          console.log('✅ Using response.data and response.total');
          return response;
        }
        // If response has nested data property (response.data.data)
        if ('data' in response && response.data && typeof response.data === 'object' && 'data' in response.data) {
          console.log('✅ Using nested response.data.data');
          return response.data;
        }
        // If response is array directly
        if (Array.isArray(response)) {
          console.log('✅ Response is array directly');
          return { data: response, total: response.length };
        }
        // If response.data is array
        if ('data' in response && Array.isArray(response.data)) {
          console.log('✅ Using response.data as array');
          return { data: response.data, total: response.total || response.data.length };
        }
      }
      console.warn('⚠️ Unknown response structure:', response);
      return { data: [], total: 0 };
    },
  });

  const requests: PurchaseRequest[] = requestsData?.data || [];
  const total = requestsData?.total || 0;

  // Fetch purchase orders to check which PRs have been converted
  const { data: ordersData } = useQuery({
    queryKey: ['purchase-orders-for-pr-check'],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/purchase/orders?page=1&limit=1000');
        // Handle different response structures
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response?.orders && Array.isArray(response.orders)) {
          return response.orders;
        }
        return [];
      } catch (err) {
        console.warn('Failed to fetch orders for PR check:', err);
        return [];
      }
    },
  });

  // Create a map of purchase_request_id -> purchase_order
  const prToPoMap = new Map<string, { id: string; order_number: string }>();
  if (ordersData && Array.isArray(ordersData)) {
    ordersData.forEach((order: any) => {
      if (order.purchase_request_id) {
        prToPoMap.set(order.purchase_request_id, {
          id: order.id,
          order_number: order.order_number || order.orderNumber,
        });
      }
    });
  }

  // Delete purchase request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/purchase/purchase-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Xóa yêu cầu mua hàng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa yêu cầu mua hàng thất bại');
    },
  });

  // Submit purchase request mutation
  const submitRequestMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/purchase/purchase-requests/${id}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Gửi yêu cầu duyệt thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gửi yêu cầu duyệt thất bại');
    },
  });

  // Approve purchase request mutation
  const approveRequestMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/purchase/purchase-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Phê duyệt yêu cầu mua hàng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Phê duyệt yêu cầu mua hàng thất bại');
    },
  });

  // Reject purchase request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason: string }) =>
      apiClient.post(`/api/purchase/purchase-requests/${id}/reject`, { rejection_reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast.success('Từ chối yêu cầu mua hàng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Từ chối yêu cầu mua hàng thất bại');
    },
  });

  const handleDeleteRequest = (requestId: string, requestNumber: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa yêu cầu "${requestNumber}"?`)) {
      deleteRequestMutation.mutate(requestId);
    }
  };

  const handleSubmitRequest = (requestId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn gửi yêu cầu này để duyệt?')) {
      submitRequestMutation.mutate(requestId);
    }
  };

  const handleApproveRequest = (requestId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu này?')) {
      approveRequestMutation.mutate(requestId);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const reason = window.prompt('Vui lòng nhập lý do từ chối:');
    if (reason && reason.trim()) {
      rejectRequestMutation.mutate({ id: requestId, rejection_reason: reason.trim() });
    }
  };

  const handleViewRequest = async (requestId: string) => {
    try {
      const response = await apiClient.get(`/api/purchase/purchase-requests/${requestId}`);
      setSelectedRequest(response.data || response);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast.error('Không thể tải chi tiết yêu cầu');
    }
  };

  const handleEditRequest = async (requestId: string) => {
    try {
      const response = await apiClient.get(`/api/purchase/purchase-requests/${requestId}`);
      setEditingRequest(response.data || response);
      setIsEditDialogOpen(true);
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu chỉnh sửa');
    }
  };

  const handleConvertToOrder = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setIsConvertDialogOpen(true);
  };

  if (error) {
    console.error('❌ Purchase Requests Error:', error);
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Lỗi khi tải dữ liệu: {error.message}</p>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug info
  console.log('📊 Purchase Requests State:', {
    isLoading,
    requestsData,
    requests,
    total,
    requestsLength: requests.length,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Yêu Cầu Mua Hàng</h1>
            <Link href="/admin/purchase/orders">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Đơn Đặt Hàng
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 mt-1">Quản lý yêu cầu mua hàng và chuyển đổi sang đơn đặt hàng</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Yêu Cầu Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Yêu Cầu Mua Hàng</DialogTitle>
              <DialogDescription>
                Tạo yêu cầu mua hàng mới. Sau khi tạo, bạn có thể gửi để duyệt.
              </DialogDescription>
            </DialogHeader>
            <CreatePurchaseRequestForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Luồng Nghiệp Vụ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-500">1. Nháp</Badge>
              <span className="text-gray-600">→ Tạo yêu cầu</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500">2. Chờ Duyệt</Badge>
              <span className="text-gray-600">→ Gửi để duyệt</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">3. Đã Duyệt</Badge>
              <span className="text-gray-600">→ Phê duyệt</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">4. Đơn Đặt Hàng</Badge>
              <span className="text-gray-600">→ Chuyển đổi sang PO</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo số yêu cầu, lý do..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="PENDING_APPROVAL">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Yêu Cầu Mua Hàng</CardTitle>
          <CardDescription>
            Tổng cộng: {total} yêu cầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Lỗi: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu
              {requestsData && (
                <div className="mt-2 text-xs text-gray-400">
                  Debug: requestsData = {JSON.stringify(requestsData, null, 2)}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số Yêu Cầu</TableHead>
                    <TableHead>Kho</TableHead>
                    <TableHead>Ngày Yêu Cầu</TableHead>
                    <TableHead>Ngày Cần</TableHead>
                    <TableHead>Lý Do</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Người Yêu Cầu</TableHead>
                    <TableHead>Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number}</TableCell>
                      <TableCell>{request.warehouse_id}</TableCell>
                      <TableCell>{formatDateOnly(request.request_date)}</TableCell>
                      <TableCell>
                        {request.required_date ? formatDateOnly(request.required_date) : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.requested_by}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'DRAFT' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRequest(request.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmitRequest(request.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRequest(request.id, request.request_number)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectRequest(request.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'APPROVED' && (() => {
                            const convertedPo = prToPoMap.get(request.id);
                            if (convertedPo) {
                              // Already converted - show link to PO
                              return (
                                <Link href={`/admin/purchase/orders`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 bg-green-50 hover:bg-green-100 cursor-pointer"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Đã chuyển
                                  </Button>
                                </Link>
                              );
                            } else {
                              // Not converted yet - show convert button
                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleConvertToOrder(request)}
                                  className="text-blue-600"
                                >
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Chuyển PO
                                </Button>
                              );
                            }
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {total > 10 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {Math.ceil(total / 10)}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= Math.ceil(total / 10)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Yêu Cầu Mua Hàng</DialogTitle>
          </DialogHeader>
          {selectedRequest && <PurchaseRequestDetail request={selectedRequest} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingRequest(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Yêu Cầu Mua Hàng</DialogTitle>
            <DialogDescription>Cập nhật thông tin trước khi gửi duyệt</DialogDescription>
          </DialogHeader>
          {editingRequest && (
            <EditPurchaseRequestForm
              request={editingRequest}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingRequest(null);
                queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
                toast.success('Cập nhật yêu cầu mua hàng thành công');
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingRequest(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Convert to Order Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chuyển Đổi Sang Đơn Đặt Hàng</DialogTitle>
            <DialogDescription>
              Chuyển đổi yêu cầu mua hàng đã duyệt sang đơn đặt hàng với nhà cung cấp
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <ConvertToOrderForm
              request={selectedRequest}
              onSuccess={() => {
                setIsConvertDialogOpen(false);
                setSelectedRequest(null);
                // Invalidate cả purchase-requests và purchase-orders để refresh data
                queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
                queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
                queryClient.invalidateQueries({ queryKey: ['purchase-orders-for-pr-check'] });
                toast.success('Tạo đơn đặt hàng thành công!');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Purchase Request Form Component
function CreatePurchaseRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    warehouse_id: '',
    request_date: new Date().toISOString().split('T')[0],
    required_date: '',
    reason: '',
    notes: '',
    items: [] as Array<{
      product_id: number;
      product_name: string;
      product_sku?: string;
      quantity: number;
      unit?: string;
      estimated_unit_cost?: number;
      notes?: string;
    }>,
  });

  // Fetch products for selection
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const { data: productsData } = useProducts(1, 100, productSearchTerm);
  const products: ProductResponse[] = productsData?.products || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/purchase/purchase-requests', data),
    onSuccess: () => {
      toast.success('Tạo yêu cầu mua hàng thành công');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo yêu cầu mua hàng thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    createMutation.mutate(formData);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: 0,
          product_name: '',
          quantity: 1,
          unit: '',
          estimated_unit_cost: 0,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  // Hàm xử lý khi chọn sản phẩm
  const handleProductSelect = (index: number, productId: number) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_sku: selectedProduct.sku,
        unit: selectedProduct.unit || '',
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kho *</label>
          <Input
            value={formData.warehouse_id}
            onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Yêu Cầu *</label>
          <Input
            type="date"
            value={formData.request_date}
            onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Cần</label>
          <Input
            type="date"
            value={formData.required_date}
            onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lý Do *</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ghi Chú</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Sản Phẩm *</label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm Sản Phẩm
          </Button>
        </div>
        
        {/* Search products */}
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>

        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex gap-2">
                {/* Dropdown chọn sản phẩm */}
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Chọn Sản Phẩm *
                  </label>
                  <Select
                    value={item.product_id?.toString() || ''}
                    onValueChange={(value) => handleProductSelect(index, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-product" disabled>
                          {productSearchTerm ? 'Không tìm thấy sản phẩm' : 'Đang tải...'}
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Thông tin sản phẩm đã chọn - tự động điền */}
              {item.product_id > 0 && (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                  <div>
                    <label className="text-xs text-gray-600">Tên sản phẩm</label>
                    <Input
                      value={item.product_name}
                      readOnly
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">SKU</label>
                    <Input
                      value={item.product_sku || ''}
                      readOnly
                      className="bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Các trường nhập liệu khác */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Số lượng *
                  </label>
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Đơn vị
                  </label>
                  <Input
                    value={item.unit || ''}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    placeholder="Tự động từ sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Giá ước tính (VNĐ)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.estimated_unit_cost || ''}
                    onChange={(e) => updateItem(index, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Ghi chú
                </label>
                <Input
                  value={item.notes || ''}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  placeholder="Ghi chú cho sản phẩm này..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Hủy
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Đang tạo...' : 'Tạo Yêu Cầu'}
        </Button>
      </div>
    </form>
  );
}

function EditPurchaseRequestForm({
  request,
  onSuccess,
  onCancel,
}: {
  request: PurchaseRequest;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const normalizeDate = (value?: string | Date) => {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value.slice(0, 10) : '';
    }
    return date.toISOString().split('T')[0];
  };

  const mapRequestItems = (items?: PurchaseRequestItem[]) =>
    (items || []).map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit: item.unit,
      estimated_unit_cost: item.estimated_unit_cost,
      notes: item.notes,
    }));

  const [formData, setFormData] = useState({
    warehouse_id: request.warehouse_id,
    request_date: normalizeDate(request.request_date),
    required_date: normalizeDate(request.required_date),
    reason: request.reason,
    notes: request.notes || '',
    items: mapRequestItems(request.items),
  });

  useEffect(() => {
    setFormData({
      warehouse_id: request.warehouse_id,
      request_date: normalizeDate(request.request_date),
      required_date: normalizeDate(request.required_date),
      reason: request.reason,
      notes: request.notes || '',
      items: mapRequestItems(request.items),
    });
  }, [request]);

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const { data: productsData } = useProducts(1, 100, productSearchTerm);
  const products: ProductResponse[] = productsData?.products || [];

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.patch(`/api/purchase/purchase-requests/${request.id}`, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật yêu cầu mua hàng thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    updateMutation.mutate(formData);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: 0,
          product_name: '',
          quantity: 1,
          unit: '',
          estimated_unit_cost: 0,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleProductSelect = (index: number, productId: number) => {
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_sku: selectedProduct.sku,
        unit: selectedProduct.unit || '',
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kho *</label>
          <Input
            value={formData.warehouse_id}
            onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Yêu Cầu *</label>
          <Input
            type="date"
            value={formData.request_date}
            onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Cần</label>
          <Input
            type="date"
            value={formData.required_date}
            onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lý Do *</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ghi Chú</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Sản Phẩm *</label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm Sản Phẩm
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>

        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Chọn Sản Phẩm *
                  </label>
                  <Select
                    value={item.product_id?.toString() || ''}
                    onValueChange={(value) => handleProductSelect(index, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-product" disabled>
                          {productSearchTerm ? 'Không tìm thấy sản phẩm' : 'Đang tải...'}
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {item.product_id > 0 && (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                  <div>
                    <label className="text-xs text-gray-600">Tên sản phẩm</label>
                    <Input value={item.product_name} readOnly className="bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">SKU</label>
                    <Input value={item.product_sku || ''} readOnly className="bg-white" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Số lượng *
                  </label>
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Đơn vị</label>
                  <Input
                    value={item.unit || ''}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    placeholder="Tự động từ sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Giá ước tính (VNĐ)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.estimated_unit_cost || ''}
                    onChange={(e) =>
                      updateItem(index, 'estimated_unit_cost', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Ghi chú</label>
                <Input
                  value={item.notes || ''}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  placeholder="Ghi chú cho sản phẩm này..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
}

// Purchase Request Detail Component
function PurchaseRequestDetail({ request }: { request: PurchaseRequest }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Số Yêu Cầu</label>
          <p className="font-semibold">{request.request_number}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Trạng Thái</label>
          <Badge className={getStatusColor(request.status)}>
            {getStatusText(request.status)}
          </Badge>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Kho</label>
          <p>{request.warehouse_id}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Ngày Yêu Cầu</label>
          <p>{formatDateOnly(request.request_date)}</p>
        </div>
        {request.required_date && (
          <div>
            <label className="text-sm font-medium text-gray-600">Ngày Cần</label>
            <p>{formatDateOnly(request.required_date)}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-600">Người Yêu Cầu</label>
          <p>{request.requested_by}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Lý Do</label>
        <p className="mt-1">{request.reason}</p>
      </div>

      {request.notes && (
        <div>
          <label className="text-sm font-medium text-gray-600">Ghi Chú</label>
          <p className="mt-1">{request.notes}</p>
        </div>
      )}

      {request.items && request.items.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">Sản Phẩm</label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản Phẩm</TableHead>
                <TableHead>Số Lượng</TableHead>
                <TableHead>Đơn Vị</TableHead>
                <TableHead>Giá Ước Tính</TableHead>
                <TableHead>Thành Tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit || '-'}</TableCell>
                  <TableCell>
                    {item.estimated_unit_cost
                      ? new Intl.NumberFormat('vi-VN').format(item.estimated_unit_cost)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.estimated_unit_cost
                      ? new Intl.NumberFormat('vi-VN').format(
                          item.quantity * item.estimated_unit_cost
                        )
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Convert to Order Form Component
function ConvertToOrderForm({
  request,
  onSuccess,
}: {
  request: PurchaseRequest;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: request.required_date || '',
    predicted_arrival_date: '',
    port_name: '',
    payment_term: '',
    payment_method: '',
    notes: '',
    importer: {
      importer_name: '',
      importer_phone: '',
      importer_fax: '',
      importer_email: '',
    },
  });

  const convertMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.post(`/api/purchase/purchase-requests/${request.id}/convert-to-order`, data),
    onSuccess: () => {
      toast.success('Chuyển đổi sang đơn đặt hàng thành công');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Chuyển đổi thất bại');
    },
  });

  const sanitizeImporter = (
    importer: typeof formData.importer,
  ):
    | {
        importer_name?: string;
        importer_phone?: string;
        importer_fax?: string;
        importer_email?: string;
      }
    | undefined => {
    const cleaned = {
      importer_name: importer.importer_name?.trim(),
      importer_phone: importer.importer_phone?.trim(),
      importer_fax: importer.importer_fax?.trim(),
      importer_email: importer.importer_email?.trim(),
    };
    const hasValue = Object.values(cleaned).some((value) => !!value);
    return hasValue ? cleaned : undefined;
  };

  const updateImporterField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      importer: {
        ...prev.importer,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const importerPayload = sanitizeImporter(formData.importer);
    const payload: any = {
      ...formData,
      supplier_id: parseInt(formData.supplier_id),
      importer: importerPayload,
    };
    if (!importerPayload) {
      delete payload.importer;
    }
    convertMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Yêu cầu:</strong> {request.request_number}
        </p>
        <p className="text-sm text-blue-800">
          <strong>Số sản phẩm:</strong> {request.items?.length || 0}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nhà Cung Cấp *</label>
          <Input
            type="number"
            value={formData.supplier_id}
            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
            placeholder="Nhập ID nhà cung cấp"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Đặt Hàng *</label>
          <Input
            type="date"
            value={formData.order_date}
            onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Giao Dự Kiến</label>
          <Input
            type="date"
            value={formData.expected_delivery_date}
            onChange={(e) =>
              setFormData({ ...formData, expected_delivery_date: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày Đến Dự Kiến</label>
          <Input
            type="date"
            value={formData.predicted_arrival_date}
            onChange={(e) =>
              setFormData({ ...formData, predicted_arrival_date: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên Cảng</label>
          <Input
            value={formData.port_name}
            onChange={(e) => setFormData({ ...formData, port_name: e.target.value })}
            placeholder="VD: Cảng Sài Gòn"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Điều Khoản Thanh Toán</label>
          <Input
            value={formData.payment_term}
            onChange={(e) => setFormData({ ...formData, payment_term: e.target.value })}
            placeholder="VD: Net 30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phương Thức Thanh Toán</label>
          <Input
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            placeholder="VD: Chuyển khoản"
          />
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-semibold mb-3">Thông tin Importer</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Tên Importer
            </label>
            <Input
              value={formData.importer.importer_name}
              onChange={(e) => updateImporterField('importer_name', e.target.value)}
              placeholder="VD: Công ty TNHH ABC Import"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Số điện thoại
            </label>
            <Input
              value={formData.importer.importer_phone}
              onChange={(e) => updateImporterField('importer_phone', e.target.value)}
              placeholder="+84-28-xxxx-xxxx"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Fax
            </label>
            <Input
              value={formData.importer.importer_fax}
              onChange={(e) => updateImporterField('importer_fax', e.target.value)}
              placeholder="+84-28-xxxx-xxxx"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Email
            </label>
            <Input
              type="email"
              value={formData.importer.importer_email}
              onChange={(e) => updateImporterField('importer_email', e.target.value)}
              placeholder="logistics@example.com"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ghi Chú</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Hủy
        </Button>
        <Button type="submit" disabled={convertMutation.isPending}>
          {convertMutation.isPending ? 'Đang chuyển đổi...' : 'Tạo Đơn Đặt Hàng'}
        </Button>
      </div>
    </form>
  );
}

