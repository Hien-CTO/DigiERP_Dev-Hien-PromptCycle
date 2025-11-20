import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { InventoryResponse } from '@/types/inventory';

export const useInventory = (productId: number, warehouseId: number) => {
  return useQuery<InventoryResponse>({
    queryKey: ['inventory', productId, warehouseId],
    queryFn: () => apiClient.get(`/api/inventory?productId=${productId}&warehouseId=${warehouseId}`),
    enabled: !!productId && !!warehouseId,
  });
};
