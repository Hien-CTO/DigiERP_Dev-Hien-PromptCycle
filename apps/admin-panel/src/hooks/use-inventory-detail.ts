import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface InventoryBatchItem {
  id: number;
  batchNumber: string;
  expiryDate?: Date;
  receiptDate: Date;
  quantity: number;
  locationCode?: string;
  locationDescription?: string;
  areaId?: number;
  areaName?: string;
}

export interface InventoryDetailStatistics {
  totalQuantity: number;
  totalBatches: number;
  expiringBatches: number;
  pendingOrders: number;
}

export interface InventoryDetailResponse {
  productId: number;
  productSku: string;
  productName: string;
  unit: string;
  warehouseId: number;
  warehouseName: string;
  statistics: InventoryDetailStatistics;
  batches: InventoryBatchItem[];
  totalQuantity: number;
}

export interface InventoryDetailQuery {
  productId: number;
  warehouseId: number;
  search?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
}

export const useInventoryDetail = (query: InventoryDetailQuery) => {
  return useQuery<InventoryDetailResponse>({
    queryKey: ['inventory-detail', query],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('productId', query.productId.toString());
      params.append('warehouseId', query.warehouseId.toString());
      if (query.search) params.append('search', query.search);
      if (query.expiryDateFrom) params.append('expiryDateFrom', query.expiryDateFrom);
      if (query.expiryDateTo) params.append('expiryDateTo', query.expiryDateTo);
      
      return apiClient.get(`/api/inventory-detail?${params.toString()}`);
    },
    enabled: !!query.productId && !!query.warehouseId,
  });
};



