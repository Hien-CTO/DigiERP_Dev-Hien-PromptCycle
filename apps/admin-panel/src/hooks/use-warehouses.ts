import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  status: string;
  capacity?: number;
  currentUtilization?: number;
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useWarehouses = (page: number = 1, limit: number = 50, search?: string) => {
  return useQuery<WarehousesResponse>({
    queryKey: ['warehouses', page, limit, search],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      
      return apiClient.get(`/api/warehouses?${params.toString()}`);
    },
  });
};

