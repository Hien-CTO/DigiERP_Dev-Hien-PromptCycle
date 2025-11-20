'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, Warehouse, MapPin } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import apiClient from '@/lib/api';

interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  ward: string;
  state: string;
  postalCode: string;
  country: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  tenantId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export default function WarehousesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch warehouses
  const { data: warehousesData, isLoading, error } = useQuery({
    queryKey: ['warehouses', currentPage, searchTerm],
    queryFn: async () => {
      const response = await apiClient.get(`/api/inventory/warehouses?page=${currentPage}&limit=10&search=${searchTerm}`);
      return response.data || response;
    },
  });

  // Delete warehouse mutation
  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/inventory/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Xóa kho thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa kho thất bại');
    },
  });

  const handleDeleteWarehouse = (warehouseId: number, warehouseName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${warehouseName}"?`)) {
      deleteWarehouseMutation.mutate(warehouseId);
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
          <h1 className="text-3xl font-bold text-gray-900">Danh mục Kho</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin các kho hàng trong hệ thống
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm kho mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm kho mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin kho để tạo mới
              </DialogDescription>
            </DialogHeader>
            <CreateWarehouseForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
          <CardDescription>
            Tìm kiếm kho theo tên hoặc địa chỉ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm kho..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách kho</CardTitle>
          <CardDescription>
            {warehousesData?.total || 0} kho trong hệ thống
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
                    <TableHead>Kho</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Diện tích (m²)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehousesData?.warehouses?.map((warehouse: Warehouse) => {
                    if (!warehouse) return null;
                    const capacity = warehouse.capacity != null ? Number(warehouse.capacity) : 0;
                    return (
                    <TableRow key={warehouse.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Warehouse className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{warehouse.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {warehouse.ward || ''}, {warehouse.state || ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{warehouse.address || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {capacity.toLocaleString()} m²
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          warehouse.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          warehouse.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {warehouse.status === 'ACTIVE' ? 'Hoạt động' :
                           warehouse.status === 'INACTIVE' ? 'Ngừng hoạt động' : 'Bảo trì'}
                        </span>
                      </TableCell>
                      <TableCell>{warehouse.createdAt ? formatDate(warehouse.createdAt) : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Xem chi tiết"
                            onClick={() => setSelectedWarehouse(warehouse)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Chỉnh sửa">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa"
                            onClick={() => handleDeleteWarehouse(warehouse.id, warehouse.name || '')}
                            disabled={deleteWarehouseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Warehouse Detail Dialog */}
      {selectedWarehouse && (
        <Dialog open={!!selectedWarehouse} onOpenChange={() => setSelectedWarehouse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết kho</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về kho {selectedWarehouse.name}
              </DialogDescription>
            </DialogHeader>
            <WarehouseDetailView warehouse={selectedWarehouse} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Warehouse Form Component
function CreateWarehouseForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    ward: '',
    state: '',
    postalCode: '',
    country: 'Vietnam',
    capacity: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
    tenantId: undefined as number | undefined,
    notes: '',
  });

  const queryClient = useQueryClient();

  // Fetch tenants for selection
  const { data: tenantsData } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await apiClient.get('/api/tenants');
      return response.data || response;
    },
  });

  const tenants = tenantsData?.tenants || [];

  const createWarehouseMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/inventory/warehouses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Tạo kho thành công');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo kho thất bại');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { city, ...restFormData } = formData; // Remove city if exists
    const submitData = {
      ...restFormData,
      postalCode: formData.postalCode || undefined, // Send undefined if empty
      tenantId: formData.tenantId || undefined,
    };
    createWarehouseMutation.mutate(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Tên kho *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Mã kho *</label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          required
          placeholder="VD: WH-001"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tenant *</label>
        <Select
          value={formData.tenantId?.toString() || 'all'}
          onValueChange={(value) => setFormData({ ...formData, tenantId: value && value !== 'all' ? parseInt(value) : undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn tenant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tenant</SelectItem>
            {tenants.map((tenant: any) => (
              <SelectItem key={tenant.id} value={tenant.id.toString()}>
                {tenant.displayName || tenant.name} ({tenant.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Địa chỉ *</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Phường *</label>
          <Input
            value={formData.ward}
            onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tỉnh/Thành phố *</label>
          <Input
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Mã bưu điện</label>
          <Input
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Quốc gia</label>
          <Input
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Diện tích (m²) *</label>
        <Input
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Trạng thái *</label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
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
        <Button type="submit" disabled={createWarehouseMutation.isPending}>
          {createWarehouseMutation.isPending ? 'Đang tạo...' : 'Tạo kho'}
        </Button>
      </div>
    </form>
  );
}

// Warehouse Detail View Component
function WarehouseDetailView({ warehouse }: { warehouse: Warehouse }) {
  if (!warehouse) return null;
  const capacity = warehouse.capacity != null ? Number(warehouse.capacity) : 0;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Tên kho</label>
          <p className="text-sm">{warehouse.name || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Mã kho</label>
          <p className="text-sm">{warehouse.code || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Diện tích</label>
          <p className="text-sm">{capacity.toLocaleString()} m²</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tenant ID</label>
          <p className="text-sm">{warehouse.tenantId || 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
        <p className="text-sm">{warehouse.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Phường</label>
          <p className="text-sm">{warehouse.ward || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tỉnh/Thành phố</label>
          <p className="text-sm">{warehouse.state || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Mã bưu điện</label>
          <p className="text-sm">{warehouse.postalCode || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Quốc gia</label>
          <p className="text-sm">{warehouse.country}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Trạng thái</label>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          warehouse.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          warehouse.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {warehouse.status === 'ACTIVE' ? 'Hoạt động' :
           warehouse.status === 'INACTIVE' ? 'Ngừng hoạt động' : 'Bảo trì'}
        </span>
      </div>

      {warehouse.notes && (
        <div>
          <label className="text-sm font-medium text-gray-500">Ghi chú</label>
          <p className="text-sm">{warehouse.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
          <p className="text-sm">{formatDate(warehouse.createdAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
          <p className="text-sm">{formatDate(warehouse.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
