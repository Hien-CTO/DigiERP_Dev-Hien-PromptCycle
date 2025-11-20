import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface ProductPriceResponse {
  id: number;
  productId: number;
  price: number;
  documentPrice?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface ProductPriceListResponse {
  prices: ProductPriceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductPriceRequest {
  productId: number;
  price: number;
  documentPrice?: number;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateProductPriceRequest {
  price?: number;
  documentPrice?: number;
  isActive?: boolean;
  notes?: string;
}

export const useProductPrices = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  productId?: number,
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (productId) params.append('productId', productId.toString());

  return useQuery<ProductPriceListResponse>({
    queryKey: ['product-prices', page, limit, search, productId],
    queryFn: () => apiClient.get(`/api/product-prices?${params.toString()}`),
  });
};

export const useProductPrice = (id: number) => {
  return useQuery<ProductPriceResponse>({
    queryKey: ['product-price', id],
    queryFn: () => apiClient.get(`/api/product-prices/${id}`),
    enabled: !!id,
  });
};

export const useCreateProductPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPriceRequest) =>
      apiClient.post('/api/product-prices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-prices'] });
    },
  });
};

export const useUpdateProductPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductPriceRequest }) =>
      apiClient.put(`/api/product-prices/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['product-prices'] });
      queryClient.invalidateQueries({ queryKey: ['product-price', id] });
    },
  });
};

export const useDeleteProductPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/product-prices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-prices'] });
    },
  });
};

