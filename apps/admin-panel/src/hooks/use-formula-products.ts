import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface FormulaProductResponse {
  id: number;
  name: string;
  code?: string;
  description?: string;
  brandId?: number;
  brand_id?: number;
  brand?: {
    id: number;
    name: string;
    code: string;
  };
  isActive?: boolean;
  is_active?: boolean | number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface FormulaProductListResponse {
  models: FormulaProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useFormulaProducts = (page: number = 1, limit: number = 10) => {
  return useQuery<FormulaProductListResponse>({
    queryKey: ['formula-products', page, limit],
    queryFn: () => apiClient.get(`/api/formula-products?page=${page}&limit=${limit}`),
  });
};

