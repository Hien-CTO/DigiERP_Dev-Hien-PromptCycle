import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { ProductListResponse, ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/types/product';

export const useProducts = (page: number = 1, limit: number = 10, search?: string) => {
  return useQuery<ProductListResponse>({
    queryKey: ['products', page, limit, search],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) {
        params.append('search', search);
      }
      return apiClient.get(`/api/products?${params.toString()}`);
    },
  });
};

export const useProduct = (id: number) => {
  return useQuery<ProductResponse>({
    queryKey: ['product', id],
    queryFn: () => apiClient.get(`/api/products/${id}`),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.post('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) => 
      apiClient.put(`/api/products/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useProductPrice = (productId: number, customerId?: number, quantity?: number) => {
  return useQuery({
    queryKey: ['product-price', productId, customerId, quantity],
    queryFn: () => apiClient.get(`/api/products/${productId}/price?customerId=${customerId}&quantity=${quantity}`),
    enabled: !!productId,
  });
};
