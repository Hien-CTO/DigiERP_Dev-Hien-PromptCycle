'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Search, Save, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useProducts, useProductPrice } from '@/hooks/use-products';
import { useCreateOrder } from '@/hooks/use-orders';
import { formatCurrency } from '@/lib/utils';
import { CreateOrderRequest, CreateOrderItemRequest } from '@/types/order';
import { ProductResponse } from '@/types/product';
import apiClient from '@/lib/api';

const orderSchema = z.object({
  customerId: z.number().min(1, 'Vui lòng chọn khách hàng'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  warehouseId: z.number().default(1),
  taxAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  shippingAmount: z.number().default(0),
  currency: z.string().default('VND'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().min(1, 'Vui lòng chọn sản phẩm'),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    notes: z.string().optional(),
  })).min(1, 'Vui lòng thêm ít nhất một sản phẩm'),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function CreateOrderPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<ProductResponse[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const { data: productsData } = useProducts(1, 50, searchTerm);
  const createOrderMutation = useCreateOrder();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: 0,
      warehouseId: 1,
      taxAmount: 0,
      discountAmount: 0,
      shippingAmount: 0,
      currency: 'VND',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedCustomerId = watch('customerId');

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    const product = selectedProducts.find(p => p.id === item.productId);
    if (!product) return sum;
    
    // This would normally call the price API
    const unitPrice = 1000; // Mock price
    return sum + (unitPrice * item.quantity);
  }, 0);

  const taxAmount = watch('taxAmount') || 0;
  const discountAmount = watch('discountAmount') || 0;
  const shippingAmount = watch('shippingAmount') || 0;
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  const onSubmit = (data: OrderForm) => {
    const orderData: CreateOrderRequest = {
      ...data,
      customerName: data.customerName || 'Khách hàng',
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || '',
      notes: data.notes || '',
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: () => {
        toast.success('Tạo đơn hàng thành công');
        router.push('/sales/orders');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Tạo đơn hàng thất bại');
      },
    });
  };

  const addProductToOrder = (product: ProductResponse) => {
    const existingItemIndex = watchedItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const newItems = [...watchedItems];
      newItems[existingItemIndex].quantity += 1;
      setValue('items', newItems);
    } else {
      // Add new product
      append({
        productId: product.id,
        quantity: 1,
        notes: '',
      });
      setSelectedProducts(prev => [...prev, product]);
    }
    
    setIsProductDialogOpen(false);
  };

  const removeProductFromOrder = (index: number) => {
    const productId = watchedItems[index].productId;
    remove(index);
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
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
            <h1 className="text-3xl font-bold text-gray-900">Tạo đơn hàng mới</h1>
            <p className="mt-2 text-gray-600">
              Tạo đơn hàng bán hàng mới
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
            <CardDescription>
              Nhập thông tin khách hàng cho đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerId">ID Khách hàng *</Label>
                <Input
                  id="customerId"
                  type="number"
                  {...register('customerId', { valueAsNumber: true })}
                  className={errors.customerId ? 'border-red-500' : ''}
                />
                {errors.customerId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.customerId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="customerName">Tên khách hàng</Label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register('customerEmail')}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  {...register('customerPhone')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sản phẩm</CardTitle>
                <CardDescription>
                  Thêm sản phẩm vào đơn hàng
                </CardDescription>
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Chọn sản phẩm</DialogTitle>
                    <DialogDescription>
                      Tìm kiếm và chọn sản phẩm để thêm vào đơn hàng
                    </DialogDescription>
                  </DialogHeader>
                  <ProductSelectionDialog
                    products={productsData?.products || []}
                    onSelectProduct={addProductToOrder}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có sản phẩm nào trong đơn hàng</p>
                <p className="text-sm">Nhấn &quot;Thêm sản phẩm&quot; để bắt đầu</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Đơn giá</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Thành tiền</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const product = selectedProducts.find(p => p.id === field.productId);
                    const unitPrice = 1000; // Mock price
                    const lineTotal = unitPrice * field.quantity;

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product?.name || 'Sản phẩm không tìm thấy'}</p>
                            <p className="text-sm text-gray-500">SKU: {product?.sku || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(unitPrice)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(lineTotal)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProductFromOrder(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng kết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxAmount">Thuế</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  {...register('taxAmount', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="discountAmount">Giảm giá</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  {...register('discountAmount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="shippingAmount">Phí vận chuyển</Label>
              <Input
                id="shippingAmount"
                type="number"
                {...register('shippingAmount', { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <textarea
                id="notes"
                className="w-full p-2 border rounded-md"
                rows={3}
                {...register('notes')}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={createOrderMutation.isPending || fields.length === 0}
          >
            {createOrderMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu đơn hàng
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Product Selection Dialog Component
function ProductSelectionDialog({
  products,
  onSelectProduct,
  searchTerm,
  onSearchChange,
}: {
  products: ProductResponse[];
  onSelectProduct: (product: ProductResponse) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {product.sku}
                  </code>
                </TableCell>
                <TableCell>{formatCurrency(1000)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stockStatus === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                    product.stockStatus === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stockStatus === 'IN_STOCK' ? 'Còn hàng' :
                     product.stockStatus === 'LOW_STOCK' ? 'Sắp hết' : 'Hết hàng'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onSelectProduct(product)}
                    disabled={product.stockStatus === 'OUT_OF_STOCK'}
                  >
                    Thêm
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
