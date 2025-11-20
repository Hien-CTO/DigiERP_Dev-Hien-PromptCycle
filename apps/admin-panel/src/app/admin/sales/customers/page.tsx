'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  TrendingUp, 
  Building2, 
  User, 
  Tag,
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Filter
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useCustomers, 
  useCustomerStatistics, 
  useCustomerGroups,
  useSalesRepresentatives,
  useDeleteCustomer,
  useCreateCustomer
} from '@/hooks/use-customers';
import { formatDate, getStatusColor, getStatusText, formatCurrency } from '@/lib/utils';
import { Customer, CustomerStatistics } from '@/types/customer';
import apiClient from '@/lib/api';

export default function CustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data with React Query
  const { data: customersData, isLoading, error } = useCustomers(
    currentPage, 
    50, 
    searchTerm,
    selectedGroup !== 'all' ? selectedGroup : undefined,
    selectedSalesRep !== 'all' ? parseInt(selectedSalesRep) : undefined,
    selectedStatus
  );

  const { data: statistics } = useCustomerStatistics();
  const { data: customerGroups } = useCustomerGroups();
  const { data: salesRepresentatives } = useSalesRepresentatives();
  const deleteCustomerMutation = useDeleteCustomer();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customerName}"?`)) {
      deleteCustomerMutation.mutate(customerId, {
        onSuccess: () => {
          toast.success('Xóa khách hàng thành công');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Xóa khách hàng thất bại');
        },
      });
    }
  };

  // Prepare statistics data
  const stats: CustomerStatistics = statistics || {
    totalCustomers: 0,
    activeCustomers: 0,
    companyCustomers: 0,
    companyCustomersActive: 0,
    individualCustomers: 0,
    individualCustomersActive: 0,
    totalGroups: 0,
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin khách hàng và phân loại khách hàng
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm khách hàng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm khách hàng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin khách hàng để tạo mới
              </DialogDescription>
            </DialogHeader>
            <CreateCustomerForm 
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['customers'] });
                queryClient.invalidateQueries({ queryKey: ['customer-statistics'] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Section 1: Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng Khách Hàng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số khách hàng trong hệ thống
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Khách Hàng Doanh Nghiệp */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng doanh nghiệp</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.companyCustomersActive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.companyCustomers} tổng số / {stats.companyCustomersActive} đang active
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Khách Hàng Cá Nhân */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng cá nhân</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.individualCustomersActive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.individualCustomers} tổng số / {stats.individualCustomersActive} đang active
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Nhóm Khách Hàng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhóm khách hàng</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Số lượng nhóm khách hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Lọc danh sách khách hàng theo các tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Customer Group Filter */}
            <div>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Nhóm khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {customerGroups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={selectedStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng giao dịch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Customer List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>
            Quản lý và theo dõi thông tin khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã KH</TableHead>
                    <TableHead>Tên KH</TableHead>
                    <TableHead>Nhóm KH</TableHead>
                    <TableHead>SĐT chính</TableHead>
                    <TableHead>Mã số thuế</TableHead>
                    <TableHead>Nhân viên Sales</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersData?.customers?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.code || `KH-${customer.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.customerGroup?.name || 'Chưa phân loại'}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell>{customer.taxCode || 'N/A'}</TableCell>
                      <TableCell>
                        {customer.salesRepresentative 
                          ? `${customer.salesRepresentative.firstName} ${customer.salesRepresentative.lastName}`
                          : customer.salesRep || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? "default" : "secondary"}>
                          {customer.isActive ? 'Hoạt động' : 'Ngừng giao dịch'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xem chi tiết"
                            onClick={() => router.push(`/admin/sales/customers/${customer.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Chỉnh sửa"
                            onClick={() => router.push(`/admin/sales/customers/${customer.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                            disabled={deleteCustomerMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!customersData?.customers || customersData.customers.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
                </div>
              )}

              {/* Footer: Pagination */}
              {customersData && customersData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, customersData.total)} trong tổng số {customersData.total} khách hàng
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="px-4 py-2 text-sm">
                      Trang {currentPage} / {customersData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(customersData.totalPages, prev + 1))}
                      disabled={currentPage === customersData.totalPages}
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

      {/* Customer Detail Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết khách hàng</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về khách hàng {selectedCustomer.name}
              </DialogDescription>
            </DialogHeader>
            <CustomerDetailView customer={selectedCustomer} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Customer Form Component
function CreateCustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const [customerGroups, setCustomerGroups] = useState<Array<{ id: string; name: string; isCompany: boolean; color?: string; description?: string }>>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedGroupData, setSelectedGroupData] = useState<{ id: string; name: string; isCompany: boolean; description?: string } | null>(null);
  const { data: statistics } = useCustomerStatistics();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    contactPerson: '',
    paymentTerms: '',
    creditLimit: 0,
    notes: '',
    salesRep: '',
    customerGroupId: '',
  });

  const createCustomerMutation = useCreateCustomer();

  // Generate code when form opens or statistics change
  useEffect(() => {
    const generateCode = () => {
      const totalCustomers = statistics?.totalCustomers || 0;
      const nextNumber = totalCustomers + 1;
      const generatedCode = `CUST${String(nextNumber).padStart(7, '0')}`;
      setFormData(prev => ({ ...prev, code: generatedCode }));
    };
    
    if (statistics !== undefined) {
      generateCode();
    }
  }, [statistics]);

  useEffect(() => {
    const fetchCustomerGroups = async () => {
      try {
        const apiClient = (await import('@/lib/api')).default;
        const data = await apiClient.get('/api/customers/groups');
        setCustomerGroups(data);
      } catch (error) {
        console.error('Error fetching customer groups:', error);
      }
    };
    fetchCustomerGroups();
  }, []);

  useEffect(() => {
    const group = customerGroups.find(g => g.id === selectedGroup);
    setSelectedGroupData(group || null);
    setFormData(prev => ({ ...prev, customerGroupId: selectedGroup }));
  }, [selectedGroup, customerGroups]);

  // Format number with US thousands separator (1,234,567)
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString('en-US');
  };

  // Parse formatted number string back to number
  const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned) || 0;
    return Math.round(parsed);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return false;
    }
    if (!selectedGroup) {
      toast.error('Vui lòng chọn nhóm khách hàng');
      return false;
    }
    if (selectedGroupData?.isCompany) {
      if (!formData.taxCode.trim()) {
        toast.error('Mã số thuế là bắt buộc đối với khách hàng công ty');
        return false;
      }
      if (!formData.contactPerson.trim()) {
        toast.error('Người liên hệ là bắt buộc đối với khách hàng công ty');
        return false;
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createCustomerMutation.mutate(formData, {
      onSuccess: (data) => {
        toast.success('Tạo khách hàng thành công!');
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khách hàng');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Customer Code (Auto-generated, Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="code">Mã khách hàng</Label>
        <Input
          id="code"
          value={formData.code}
          readOnly
          className="bg-gray-50 cursor-not-allowed"
          placeholder="Sẽ tự động tạo khi lưu"
        />
        <p className="text-xs text-gray-500">
          Mã khách hàng được tự động tạo dựa trên số lượng khách hàng hiện có
        </p>
      </div>

      {/* Customer Group Selection */}
      <div className="space-y-2">
        <Label htmlFor="customerGroup">Nhóm khách hàng *</Label>
        <Select value={selectedGroup || undefined} onValueChange={setSelectedGroup}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhóm khách hàng" />
          </SelectTrigger>
          <SelectContent>
            {customerGroups
              .filter(group => group.id && group.id.trim() !== '')
              .map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center space-x-2">
                    {group.isCompany ? (
                      <Building2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <User className="h-4 w-4 text-green-500" />
                    )}
                    <span>{group.name}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {selectedGroupData && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center space-x-2 mb-1">
              {selectedGroupData.isCompany ? (
                <Building2 className="h-4 w-4 text-blue-500" />
              ) : (
                <User className="h-4 w-4 text-green-500" />
              )}
              <span className="font-medium">
                {selectedGroupData.isCompany ? 'Khách hàng Công ty' : 'Khách hàng Lẻ'}
              </span>
            </div>
            {selectedGroupData.isCompany && (
              <p className="text-xs text-blue-800 mt-1">
                Lưu ý: Khách hàng công ty cần có mã số thuế và người liên hệ
              </p>
            )}
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tên khách hàng *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="salesRep">Nhân viên Sales</Label>
          <Input
            id="salesRep"
            value={formData.salesRep}
            onChange={(e) => handleInputChange('salesRep', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={2}
        />
      </div>

      {/* Company Information (Conditional) */}
      {selectedGroupData?.isCompany && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxCode">Mã số thuế *</Label>
              <Input
                id="taxCode"
                value={formData.taxCode}
                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                required={selectedGroupData.isCompany}
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Người liên hệ *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                required={selectedGroupData.isCompany}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="paymentTerms">Điều khoản thanh toán</Label>
            <Select value={formData.paymentTerms || undefined} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn điều khoản thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COD">COD (Thanh toán khi giao hàng)</SelectItem>
                <SelectItem value="NET_7">Net 7 (Thanh toán trong 7 ngày)</SelectItem>
                <SelectItem value="NET_15">Net 15 (Thanh toán trong 15 ngày)</SelectItem>
                <SelectItem value="NET_30">Net 30 (Thanh toán trong 30 ngày)</SelectItem>
                <SelectItem value="NET_60">Net 60 (Thanh toán trong 60 ngày)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Financial Information */}
      <div className="space-y-4 border-t pt-4">
        <div>
          <Label htmlFor="creditLimit">Hạn mức tín dụng (VND)</Label>
          <Input
            id="creditLimit"
            type="text"
            value={formatNumber(formData.creditLimit)}
            onChange={(e) => {
              const parsedValue = parseFormattedNumber(e.target.value);
              handleInputChange('creditLimit', parsedValue);
            }}
            placeholder="Nhập hạn mức tín dụng (ví dụ: 5,000,000)"
            inputMode="numeric"
          />
        </div>
        {!selectedGroupData?.isCompany && (
          <div>
            <Label htmlFor="paymentTerms">Điều khoản thanh toán</Label>
            <Select value={formData.paymentTerms || undefined} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn điều khoản thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COD">COD (Thanh toán khi giao hàng)</SelectItem>
                <SelectItem value="NET_7">Net 7 (Thanh toán trong 7 ngày)</SelectItem>
                <SelectItem value="NET_15">Net 15 (Thanh toán trong 15 ngày)</SelectItem>
                <SelectItem value="NET_30">Net 30 (Thanh toán trong 30 ngày)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="border-t pt-4">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={createCustomerMutation.isPending}>
          {createCustomerMutation.isPending ? 'Đang tạo...' : 'Tạo khách hàng'}
        </Button>
      </div>
    </form>
  );
}

// Customer Detail View Component
function CustomerDetailView({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Mã KH</label>
          <p className="text-sm">{customer.code || `KH-${customer.id.slice(0, 8)}`}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tên khách hàng</label>
          <p className="text-sm">{customer.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
          <p className="text-sm">{customer.phone || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-sm">{customer.email || 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Mã số thuế</label>
        <p className="text-sm">{customer.taxCode || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Nhóm khách hàng</label>
          <p className="text-sm">{customer.customerGroup?.name || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
          <Badge variant={customer.isActive ? "default" : "secondary"}>
            {customer.isActive ? 'Hoạt động' : 'Ngừng giao dịch'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Nhân viên Sales</label>
          <p className="text-sm">
            {customer.salesRepresentative 
              ? `${customer.salesRepresentative.firstName} ${customer.salesRepresentative.lastName}`
              : customer.salesRep || 'N/A'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Hạn mức tín dụng</label>
          <p className="text-sm">{formatCurrency(customer.creditLimit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
          <p className="text-sm">{formatDate(customer.createdAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
          <p className="text-sm">{formatDate(customer.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
