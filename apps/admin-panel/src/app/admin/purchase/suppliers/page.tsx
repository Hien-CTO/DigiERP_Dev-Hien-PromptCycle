'use client';

import { useState } from 'react';
import { Search, Building2, TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

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
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/use-suppliers';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/types/purchase';
import { Switch } from '@/components/ui/switch';

type SupplierFormState = CreateSupplierDto & { is_active?: boolean };
type ApiErrorResponse = { message?: string | string[]; error?: string };

export default function SuppliersPage() {
  const initialCreateForm: CreateSupplierDto = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    tax_code: '',
    payment_terms: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    credit_limit: 0,
    notes: '',
  };

  const initialEditForm: SupplierFormState = {
    ...initialCreateForm,
    is_active: true,
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateSupplierDto>(initialCreateForm);
  const [editFormData, setEditFormData] = useState<SupplierFormState>(initialEditForm);

  const { data: suppliers, isLoading, error } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (open) {
      setCreateFormData(initialCreateForm);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier.mutateAsync(createFormData);
      setIsCreateDialogOpen(false);
      setCreateFormData(initialCreateForm);
      toast.success('Tạo nhà cung cấp thành công');
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error(getApiErrorMessage(error, 'Lỗi khi tạo nhà cung cấp'));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    try {
      await updateSupplier.mutateAsync({
        id: selectedSupplier.id,
        data: editFormData as UpdateSupplierDto,
      });
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      setEditFormData(initialEditForm);
      toast.success('Cập nhật nhà cung cấp thành công');
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error(getApiErrorMessage(error, 'Lỗi khi cập nhật nhà cung cấp'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      try {
        await deleteSupplier.mutateAsync(id);
        toast.success('Xóa nhà cung cấp thành công');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error(getApiErrorMessage(error, 'Lỗi khi xóa nhà cung cấp'));
      }
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      tax_code: supplier.tax_code || '',
      payment_terms: supplier.payment_terms || '',
      bank_name: supplier.bank_name || '',
      bank_account_name: supplier.bank_account_name || '',
      bank_account_number: supplier.bank_account_number || '',
      credit_limit: supplier.credit_limit,
      notes: supplier.notes || '',
      is_active: supplier.is_active,
    });
    setIsEditDialogOpen(true);
  };

  // Ensure suppliers is always an array
  const suppliersArray = Array.isArray(suppliers) ? suppliers : [];

  // Filter suppliers based on search and status
  const filteredSuppliers = suppliersArray.filter(supplier => {
    const matchesSearch = searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && supplier.is_active) ||
      (selectedStatus === 'inactive' && !supplier.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalSuppliers = suppliersArray.length;
  const activeSuppliers = suppliersArray.filter(s => s.is_active).length;
  const inactiveSuppliers = suppliersArray.filter(s => !s.is_active).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà cung cấp</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin nhà cung cấp
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhà cung cấp
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm nhà cung cấp mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin nhà cung cấp để tạo mới
              </DialogDescription>
            </DialogHeader>
            <CreateSupplierForm 
              formData={createFormData} 
              setFormData={setCreateFormData}
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setCreateFormData(initialCreateForm);
              }}
              isLoading={createSupplier.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhà cung cấp</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Nhà cung cấp trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Nhà cung cấp đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Nhà cung cấp không hoạt động
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm nhà cung cấp và lọc theo trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, người liên hệ, SĐT, email..."
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
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhà cung cấp</CardTitle>
          <CardDescription>
            {filteredSuppliers.length} nhà cung cấp được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Nhà cung cấp</TableHead>
                    <TableHead className="w-[11%]">Người liên hệ</TableHead>
                    <TableHead className="w-[10%]">Điều khoản thanh toán</TableHead>
                    <TableHead className="w-[15%]">Thông tin liên lạc</TableHead>
                    <TableHead className="w-[15%]">Thông tin ngân hàng</TableHead>
                    <TableHead className="w-[8%]">Hạn mức tín dụng</TableHead>
                    <TableHead className="w-[8%]">Trạng thái</TableHead>
                    <TableHead className="w-[10%]">Thời gian</TableHead>
                    <TableHead className="w-[8%]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="align-top whitespace-normal break-words">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            {supplier.tax_code && (
                              <p className="text-sm text-gray-500">
                                MST: {supplier.tax_code}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <p className="font-medium">{supplier.contact_person || '-'}</p>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <p className="text-sm">{supplier.payment_terms || '-'}</p>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <div className="space-y-1">
                          {supplier.phone && (
                            <p className="text-sm">
                              <span className="font-medium text-gray-600">SĐT:</span>{' '}
                              {supplier.phone}
                            </p>
                          )}
                          {supplier.email && (
                            <p className="text-sm text-blue-600">
                              <span className="font-medium text-gray-600">Email:</span>{' '}
                              {supplier.email}
                            </p>
                          )}
                          {supplier.address && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-600">Địa chỉ:</span>{' '}
                              {supplier.address}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <div className="space-y-1">
                          {supplier.bank_name && (
                            <p className="text-sm">
                              <span className="font-medium text-gray-600">Ngân hàng:</span>{' '}
                              {supplier.bank_name}
                            </p>
                          )}
                          {supplier.bank_account_name && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-gray-600">Chủ TK:</span>{' '}
                              {supplier.bank_account_name}
                            </p>
                          )}
                          {supplier.bank_account_number && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-600">Số TK:</span>{' '}
                              {supplier.bank_account_number}
                            </p>
                          )}
                          {!supplier.bank_name && !supplier.bank_account_name && !supplier.bank_account_number && (
                            <p className="text-sm text-gray-500">-</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <span className="font-medium">
                          {formatCurrency(supplier.credit_limit)}
                        </span>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <Badge variant={supplier.is_active ? "default" : "secondary"}>
                          {supplier.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal break-words">
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium text-gray-600">Tạo:</span>{' '}
                            {formatDate(supplier.created_at)}
                          </p>
                          <p>
                            <span className="font-medium text-gray-600">Cập nhật:</span>{' '}
                            {formatDate(supplier.updated_at)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Chỉnh sửa"
                            onClick={() => openEditDialog(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDelete(supplier.id)}
                            disabled={deleteSupplier.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy nhà cung cấp nào</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhà cung cấp</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin nhà cung cấp
            </DialogDescription>
          </DialogHeader>
          <EditSupplierForm 
            formData={editFormData} 
            setFormData={setEditFormData}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditFormData(initialEditForm);
            }}
            isLoading={updateSupplier.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Supplier Form Component
function CreateSupplierForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  formData: CreateSupplierDto;
  setFormData: (data: CreateSupplierDto) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tên nhà cung cấp *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Người liên hệ</label>
          <Input
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Số điện thoại</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Địa chỉ</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Mã số thuế</label>
          <Input
            value={formData.tax_code}
            onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Điều khoản thanh toán</label>
          <Input
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tên ngân hàng</label>
          <Input
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Chủ tài khoản</label>
          <Input
            value={formData.bank_account_name}
            onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Số tài khoản</label>
        <Input
          value={formData.bank_account_number}
          onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Hạn mức tín dụng</label>
        <Input
          type="number"
          value={formData.credit_limit}
          onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Ghi chú</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang tạo...' : 'Tạo nhà cung cấp'}
        </Button>
      </div>
    </form>
  );
}

// Edit Supplier Form Component
function EditSupplierForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  formData: SupplierFormState;
  setFormData: (data: SupplierFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tên nhà cung cấp *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Người liên hệ</label>
          <Input
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Số điện thoại</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Địa chỉ</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Mã số thuế</label>
          <Input
            value={formData.tax_code}
            onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Điều khoản thanh toán</label>
          <Input
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tên ngân hàng</label>
          <Input
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Chủ tài khoản</label>
          <Input
            value={formData.bank_account_name}
            onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Số tài khoản</label>
        <Input
          value={formData.bank_account_number}
          onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Hạn mức tín dụng</label>
        <Input
          type="number"
          value={formData.credit_limit}
          onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Ghi chú</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Trạng thái hoạt động</p>
          <p className="text-sm text-muted-foreground">
            Bật để đánh dấu nhà cung cấp đang hoạt động
          </p>
        </div>
        <Switch
          checked={!!formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </div>
    </form>
  );
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const message = data?.message ?? data?.error;

    if (Array.isArray(message) && message.length > 0) {
      return message[0];
    }

    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
