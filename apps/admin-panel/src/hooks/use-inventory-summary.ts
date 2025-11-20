import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface InventorySummaryItem {
  productId: number;
  productSku: string;
  productName: string;
  unit: string;
  categoryId?: number;
  categoryName?: string;
  warehouseId?: number;
  quantityOnHand: number;
  virtualWarehouse: number;
  onLoanOut: number;
  onLoanIn: number;
  totalOwned: number;
}

export interface InventorySummaryStatistics {
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  expiringProducts: number;
}

export interface InventorySummaryResponse {
  statistics: InventorySummaryStatistics;
  items: InventorySummaryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventorySummaryQuery {
  search?: string;
  warehouseId?: number;
  categoryId?: number;
  page?: number;
  limit?: number;
}

export const useInventorySummary = (query: InventorySummaryQuery = {}) => {
  return useQuery<InventorySummaryResponse>({
    queryKey: ['inventory-summary', query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.warehouseId) params.append('warehouseId', query.warehouseId.toString());
      if (query.categoryId) params.append('categoryId', query.categoryId.toString());
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      
      return apiClient.get(`/api/inventory-summary?${params.toString()}`);
    },
  });
};

