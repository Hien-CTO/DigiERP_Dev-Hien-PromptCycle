export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId?: number;
  status?: string;
  paymentStatus?: string;
  taxAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  orderDate?: string;
  requiredDate?: string;
  shippingAddress?: string;
  billingAddress?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId?: number;
  status?: string;
  paymentStatus?: string;
  taxAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  orderDate?: string;
  requiredDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  shippingAddress?: string;
  billingAddress?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  trackingNumber?: string;
}

export interface OrderItemResponse {
  id: number;
  orderId: number;
  productId: number;
  productSku: string;
  productName: string;
  productDescription: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  discountPercentage: number;
  lineTotal: number;
  unit: string;
  weight: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  warehouseId: number;
  status: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  notes: string;
  internalNotes: string;
  orderDate: string;
  requiredDate: string;
  shippedDate: string;
  deliveredDate: string;
  shippingAddress: string;
  billingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  items: OrderItemResponse[];
}

export interface OrderListResponse {
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
