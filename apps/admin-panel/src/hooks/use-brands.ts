import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface BrandResponse {
  id: number;
  name: string;
  code?: string;
  description?: string;
  logo?: string;
  logo_url?: string;
  website?: string;
  isActive?: boolean;
  is_active?: boolean | number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface BrandListResponse {
  brands: BrandResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBrandRequest {
  name: string;
  code?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

export interface UpdateBrandRequest {
  name?: string;
  code?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

export const useBrands = (page: number = 1, limit: number = 10) => {
  return useQuery<BrandListResponse>({
    queryKey: ['brands', page, limit],
    queryFn: () => apiClient.get(`/api/brands?page=${page}&limit=${limit}`),
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBrandRequest) => apiClient.post('/api/brands', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrandRequest }) => 
      apiClient.put(`/api/brands/${id}`, data),
    onSuccess: async (updatedBrand) => {
      // Invalidate all brand queries (with any page/limit params)
      queryClient.invalidateQueries({ queryKey: ['brands'], exact: false });
      // Refetch all active brand queries and wait for completion
      await queryClient.refetchQueries({ 
        queryKey: ['brands'], 
        exact: false,
        type: 'active'
      });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

