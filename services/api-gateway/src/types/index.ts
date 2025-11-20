export interface ServiceConfig {
  name: string;
  url: string;
  healthCheckPath?: string;
  timeout?: number;
}

export interface SalesOverviewData {
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

export interface CustomerData {
  total_customers: number;
  new_customers: number;
  active_customers: number;
}

export interface AggregatedSalesOverview {
  sales: SalesOverviewData;
  customers: CustomerData;
  generated_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}
