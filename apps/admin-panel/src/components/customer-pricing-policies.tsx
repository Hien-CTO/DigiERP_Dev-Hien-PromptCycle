'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Tag, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePricingPoliciesByCustomer,
  useCreatePricingPolicy,
  useUpdatePricingPolicy,
  useDeletePricingPolicy,
  PricingPolicy,
  PricingPolicyStatus,
  CreatePricingPolicyRequest,
  UpdatePricingPolicyRequest,
} from '@/hooks/use-pricing-policies';
import { useProducts } from '@/hooks/use-products';
import { useProductPrice } from '@/hooks/use-product-pricing';
import { formatDate, formatCurrency } from '@/lib/utils';

interface CustomerPricingPoliciesProps {
  customerId: string;
}

export function CustomerPricingPolicies({ customerId }: CustomerPricingPoliciesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PricingPolicy | null>(null);

  const { data: policies, isLoading } = usePricingPoliciesByCustomer(customerId);
  const { data: productsData } = useProducts(1, 1000);
  const createMutation = useCreatePricingPolicy();
  const updateMutation = useUpdatePricingPolicy();
  const deleteMutation = useDeletePricingPolicy();

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chính sách giá này?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Xóa chính sách giá thành công');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Xóa chính sách giá thất bại');
        },
      });
    }
  };

  const getStatusBadge = (status: PricingPolicyStatus) => {
    switch (status) {
      case PricingPolicyStatus.ACTIVE:
        return (
          <Badge variant="default" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Hoạt động</span>
          </Badge>
        );
      case PricingPolicyStatus.INACTIVE:
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Không hoạt động</span>
          </Badge>
        );
      case PricingPolicyStatus.EXPIRED:
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Hết hạn</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chính sách giá</h2>
          <p className="text-muted-foreground">
            Quản lý các chính sách giá và chiết khấu cho khách hàng
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chính sách giá
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm chính sách giá mới</DialogTitle>
              <DialogDescription>
                Tạo chính sách giá mới với các sản phẩm và mức chiết khấu
              </DialogDescription>
            </DialogHeader>
            <PricingPolicyForm
              customerId={customerId}
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {policies && policies.length > 0 ? (
        <div className="space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="h-5 w-5" />
                      <span>{policy.code}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Từ: {formatDate(policy.validFrom)} - Đến:{' '}
                            {policy.validTo ? formatDate(policy.validTo) : 'Không giới hạn'}
                          </span>
                        </span>
                        {getStatusBadge(policy.status)}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPolicy(policy)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(policy.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {policy.details && policy.details.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Giá gốc</TableHead>
                        <TableHead>Chiết khấu (%)</TableHead>
                        <TableHead>Giá sau chiết khấu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policy.details.map((detail) => {
                        const product = productsData?.products?.find(
                          (p) => p.id === detail.productId,
                        );
                        return (
                          <TableRow key={detail.id}>
                            <TableCell>
                              {product
                                ? `${product.name} (${product.sku})`
                                : `ID: ${detail.productId}`}
                            </TableCell>
                            <TableCell>{formatCurrency(detail.basePrice)}</TableCell>
                            <TableCell>{detail.discountPercentage}%</TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(detail.discountedPrice)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có sản phẩm nào trong chính sách giá này
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có chính sách giá nào</p>
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo chính sách giá đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {editingPolicy && (
        <Dialog open={!!editingPolicy} onOpenChange={() => setEditingPolicy(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa chính sách giá</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin chính sách giá và các sản phẩm
              </DialogDescription>
            </DialogHeader>
            <PricingPolicyForm
              customerId={customerId}
              policy={editingPolicy}
              onSuccess={() => setEditingPolicy(null)}
              onCancel={() => setEditingPolicy(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface PricingPolicyFormProps {
  customerId: string;
  policy?: PricingPolicy;
  onSuccess: () => void;
  onCancel: () => void;
}

function PricingPolicyForm({
  customerId,
  policy,
  onSuccess,
  onCancel,
}: PricingPolicyFormProps) {
  const [formData, setFormData] = useState<CreatePricingPolicyRequest>({
    code: policy?.code || '',
    customerId: customerId,
    validFrom: policy?.validFrom
      ? new Date(policy.validFrom).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    validTo: policy?.validTo
      ? new Date(policy.validTo).toISOString().split('T')[0]
      : undefined,
    status: policy?.status || PricingPolicyStatus.ACTIVE,
    details: policy?.details
      ? policy.details.map((d) => ({
          productId: d.productId,
          basePrice: undefined, // Will be fetched from product_prices
          discountPercentage: d.discountPercentage,
        }))
      : [],
  });

  const { data: productsData } = useProducts(1, 1000);
  const createMutation = useCreatePricingPolicy();
  const updateMutation = useUpdatePricingPolicy();

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        {
          productId: 0,
          basePrice: undefined, // Will be fetched from product_prices
          discountPercentage: 0,
        },
      ],
    });
  };

  const handleRemoveDetail = (index: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index),
    });
  };

  const handleDetailChange = async (
    index: number,
    field: 'productId' | 'basePrice' | 'discountPercentage',
    value: number,
  ) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };

    // If productId changes, fetch price from API
    if (field === 'productId' && value > 0) {
      try {
        const apiClient = (await import('@/lib/api')).default;
        // Call /api/product-prices?productId=... to get list of prices
        const params = new URLSearchParams();
        params.append('productId', value.toString());
        params.append('page', '1');
        params.append('limit', '10');
        
        const response = await apiClient.get(`/api/product-prices?${params.toString()}`);
        
        const prices = response.prices || [];
        if (prices.length > 0) {
          // Find active price first, or get the first one
          const activePrice = prices.find((p: any) => p.isActive === true) || prices[0];
          newDetails[index].basePrice = activePrice.price || 0;
        } else {
          toast.error('Không tìm thấy giá cho sản phẩm này');
        }
      } catch (error) {
        console.error('Failed to fetch product price:', error);
        toast.error('Không thể lấy giá sản phẩm. Vui lòng thử lại.');
      }
    }

    setFormData({
      ...formData,
      details: newDetails,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã chính sách giá');
      return;
    }

    if (!formData.validFrom) {
      toast.error('Vui lòng chọn ngày bắt đầu hiệu lực');
      return;
    }

    if (formData.details.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    // Validate all details
    for (const detail of formData.details) {
      if (!detail.productId || detail.productId === 0) {
        toast.error('Vui lòng chọn sản phẩm cho tất cả các dòng');
        return;
      }
      // basePrice will be fetched from product_prices on backend if not provided
      if (detail.discountPercentage < 0 || detail.discountPercentage > 100) {
        toast.error('Phần trăm chiết khấu phải từ 0 đến 100');
        return;
      }
    }

    try {
      if (policy) {
        // Remove customerId when updating (customerId should not be changed after creation)
        const { customerId, ...updateData } = formData;
        await updateMutation.mutateAsync({
          id: policy.id,
          data: updateData as UpdatePricingPolicyRequest,
        });
        toast.success('Cập nhật chính sách giá thành công');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Tạo chính sách giá thành công');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Mã chính sách giá *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="VD: CSG-2025-001"
            required
            disabled={!!policy}
          />
        </div>
        <div>
          <Label htmlFor="status">Tình trạng</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as PricingPolicyStatus })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PricingPolicyStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={PricingPolicyStatus.INACTIVE}>Không hoạt động</SelectItem>
              <SelectItem value={PricingPolicyStatus.EXPIRED}>Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validFrom">Ngày bắt đầu hiệu lực *</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="validTo">Ngày kết thúc hiệu lực</Label>
          <Input
            id="validTo"
            type="date"
            value={formData.validTo || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                validTo: e.target.value || undefined,
              })
            }
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Chi tiết sản phẩm *</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddDetail}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
        <div className="space-y-2">
          {formData.details.map((detail, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label>Sản phẩm *</Label>
                    <Select
                      value={detail.productId.toString()}
                      onValueChange={(value) =>
                        handleDetailChange(index, 'productId', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {productsData?.products?.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>Giá gốc *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={detail.basePrice || ''}
                      placeholder="Tự động lấy từ giá sản phẩm"
                      disabled
                      className="bg-gray-50"
                      required
                    />
                    {!detail.basePrice && detail.productId > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Đang tải giá...</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label>Chiết khấu (%) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={detail.discountPercentage}
                      onChange={(e) =>
                        handleDetailChange(
                          index,
                          'discountPercentage',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Giá sau CK</Label>
                    <div className="h-10 flex items-center text-sm font-medium text-green-600">
                      {detail.basePrice
                        ? formatCurrency(
                            detail.basePrice -
                              (detail.basePrice * detail.discountPercentage) / 100,
                          )
                        : '-'}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveDetail(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {formData.details.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
            <Button type="button" variant="outline" onClick={handleAddDetail}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm đầu tiên
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {policy ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}

