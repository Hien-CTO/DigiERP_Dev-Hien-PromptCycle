export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  payment_terms?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  credit_limit: number;
  is_active: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSupplierDto {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  payment_terms?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  credit_limit?: number;
  notes?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  payment_terms?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  credit_limit?: number;
  is_active?: boolean;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  warehouse_id: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  order_date: Date;
  expected_delivery_date?: Date;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
  items?: PurchaseOrderItem[];
  supplier?: Supplier;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit?: string;
  unit_cost: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  received_quantity: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePurchaseOrderDto {
  order_number: string;
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_delivery_date?: string;
  items: CreatePurchaseOrderItemDto[];
  notes?: string;
}

export interface CreatePurchaseOrderItemDto {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit?: string;
  unit_cost: number;
  discount_percentage?: number;
  tax_percentage?: number;
  notes?: string;
}

export interface UpdatePurchaseOrderDto {
  order_number?: string;
  supplier_id?: string;
  warehouse_id?: string;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  order_date?: string;
  expected_delivery_date?: string;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receipt_number: string;
  purchase_order_id: string;
  warehouse_id: string;
  status: 'DRAFT' | 'RECEIVED' | 'VERIFIED' | 'CANCELLED';
  receipt_date: Date;
  total_amount: number;
  notes?: string;
  received_by?: string;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
  items?: GoodsReceiptItem[];
  purchase_order?: PurchaseOrder;
}

export interface GoodsReceiptItem {
  id: string;
  goods_receipt_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit?: string;
  unit_cost: number;
  total_amount: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGoodsReceiptDto {
  purchase_order_id: string;
  warehouse_id: string;
  receipt_date: string;
  items: CreateGoodsReceiptItemDto[];
  notes?: string;
}

export interface CreateGoodsReceiptItemDto {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit?: string;
  unit_cost: number;
  notes?: string;
}
