export interface Invoice {
  id: string;
  invoice_number: string;
  type: 'SALES' | 'PURCHASE' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  customer_tax_code?: string;
  order_id?: string;
  order_number?: string;
  invoice_date: Date;
  due_date: Date;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  currency: string;
  exchange_rate: number;
  notes?: string;
  terms_conditions?: string;
  created_by?: string;
  sent_by?: string;
  sent_at?: Date;
  paid_by?: string;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceDto {
  invoice_number: string;
  type: 'SALES' | 'PURCHASE' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  customer_tax_code?: string;
  order_id?: string;
  order_number?: string;
  invoice_date: string;
  due_date: string;
  items: CreateInvoiceItemDto[];
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  exchange_rate?: number;
  notes?: string;
  terms_conditions?: string;
}

export interface CreateInvoiceItemDto {
  product_id: string;
  product_name: string;
  product_sku?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount_percentage?: number;
  tax_percentage?: number;
}

export interface UpdateInvoiceDto {
  invoice_number?: string;
  type?: 'SALES' | 'PURCHASE' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_address?: string;
  customer_tax_code?: string;
  order_id?: string;
  order_number?: string;
  invoice_date?: string;
  due_date?: string;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  terms_conditions?: string;
}

export interface SalesOverview {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  new_customers: number;
  revenue_by_period: Record<string, number>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  revenue_growth: number;
  currency: string;
  period: string;
  generated_at: Date;
}

export interface InvoiceSummary {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  overdue_amount: number;
  average_payment_time: number;
  invoices_by_status: Record<string, number>;
  generated_at: Date;
}
