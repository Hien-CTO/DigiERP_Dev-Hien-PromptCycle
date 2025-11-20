'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, FileText, Send, CreditCard } from 'lucide-react';
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

interface Invoice {
  id: number;
  invoiceNumber: string;
  type: 'SALES' | 'PURCHASE';
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  invoiceDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

interface InvoiceItem {
  id: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxPercentage: number;
  totalAmount: number;
  notes?: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoicesData, isLoading, error } = useQuery({
    queryKey: ['invoices', currentPage, searchTerm],
    queryFn: () => apiClient.get(`/financial/invoices?page=${currentPage}&limit=10&search=${searchTerm}`),
    select: (response: any) => response.data,
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/financial/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Xóa hóa đơn thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa hóa đơn thất bại');
    },
  });

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/financial/invoices/${id}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Gửi hóa đơn thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gửi hóa đơn thất bại');
    },
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => 
      apiClient.post(`/financial/invoices/${id}/pay`, { paymentAmount: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Ghi nhận thanh toán thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ghi nhận thanh toán thất bại');
    },
  });

  const handleDeleteInvoice = (invoiceId: number, invoiceNumber: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hóa đơn "${invoiceNumber}"?`)) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  };

  const handleSendInvoice = (invoiceId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn gửi hóa đơn này?')) {
      sendInvoiceMutation.mutate(invoiceId);
    }
  };

  const handleRecordPayment = (invoiceId: number, amount: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn ghi nhận thanh toán ${amount.toLocaleString('vi-VN')} VNĐ?`)) {
      recordPaymentMutation.mutate({ id: invoiceId, amount });
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
          <h1 className="text-3xl font-bold text-gray-900">Hóa đơn</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các hóa đơn bán hàng và mua hàng
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hóa đơn
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin hóa đơn
              </DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
          <CardDescription>
            Tìm kiếm hóa đơn theo số hóa đơn hoặc khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
          <CardDescription>
            {invoicesData?.total || 0} hóa đơn trong hệ thống
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
                    <TableHead>Số hóa đơn</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Ngày hóa đơn</TableHead>
                    <TableHead>Ngày đến hạn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Đã thanh toán</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData?.invoices?.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.items?.length || 0} sản phẩm
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.type === 'SALES' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {invoice.type === 'SALES' ? 'Bán hàng' : 'Mua hàng'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{invoice.customerName || 'N/A'}</p>
                          {invoice.customerEmail && (
                            <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          invoice.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'PAID' ? 'Đã thanh toán' :
                           invoice.status === 'SENT' ? 'Đã gửi' :
                           invoice.status === 'OVERDUE' ? 'Quá hạn' :
                           invoice.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {invoice.totalAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {invoice.paidAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Xem chi tiết"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Chỉnh sửa">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Gửi hóa đơn"
                              onClick={() => handleSendInvoice(invoice.id)}
                              disabled={sendInvoiceMutation.isPending}
                            >
                              <Send className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          {invoice.status === 'SENT' && invoice.paidAmount < invoice.totalAmount && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Ghi nhận thanh toán"
                              onClick={() => handleRecordPayment(invoice.id, invoice.totalAmount - invoice.paidAmount)}
                              disabled={recordPaymentMutation.isPending}
                            >
                              <CreditCard className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                            disabled={deleteInvoiceMutation.isPending}
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

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Chi tiết hóa đơn</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về hóa đơn {selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <InvoiceDetailView invoice={selectedInvoice} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Invoice Form Component
function CreateInvoiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    type: 'SALES',
    customerId: 1,
    customerName: '',
    customerEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [] as any[],
  });

  const queryClient = useQueryClient();

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/financial/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Tạo hóa đơn thành công');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo hóa đơn thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Số hóa đơn *</label>
          <Input
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Loại hóa đơn *</label>
          <select
            className="w-full p-2 border rounded-md"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="SALES">Bán hàng</option>
            <option value="PURCHASE">Mua hàng</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tên khách hàng *</label>
          <Input
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email khách hàng</label>
          <Input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Ngày hóa đơn *</label>
          <Input
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ngày đến hạn *</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
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
        <Button type="submit" disabled={createInvoiceMutation.isPending}>
          {createInvoiceMutation.isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
        </Button>
      </div>
    </form>
  );
}

// Invoice Detail View Component
function InvoiceDetailView({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Số hóa đơn</label>
          <p className="text-sm">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Loại hóa đơn</label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            invoice.type === 'SALES' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {invoice.type === 'SALES' ? 'Bán hàng' : 'Mua hàng'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Khách hàng</label>
          <p className="text-sm">{invoice.customerName || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-sm">{invoice.customerEmail || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày hóa đơn</label>
          <p className="text-sm">{formatDate(invoice.invoiceDate)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày đến hạn</label>
          <p className="text-sm">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Trạng thái</label>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
          invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
          invoice.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {invoice.status === 'PAID' ? 'Đã thanh toán' :
           invoice.status === 'SENT' ? 'Đã gửi' :
           invoice.status === 'OVERDUE' ? 'Quá hạn' :
           invoice.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
          <p className="text-sm font-medium">{invoice.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Đã thanh toán</label>
          <p className="text-sm">{invoice.paidAmount.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Còn lại</label>
          <p className="text-sm font-medium text-red-600">
            {(invoice.totalAmount - invoice.paidAmount).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
      </div>

      {invoice.notes && (
        <div>
          <label className="text-sm font-medium text-gray-500">Ghi chú</label>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      )}

      {/* Items Table */}
      {invoice.items && invoice.items.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-500">Chi tiết sản phẩm</label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Thuế</TableHead>
                  <TableHead>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
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
                    <TableCell>{item.discountPercentage}%</TableCell>
                    <TableCell>{item.taxPercentage}%</TableCell>
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
          <p className="text-sm">{formatDate(invoice.createdAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
          <p className="text-sm">{formatDate(invoice.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
