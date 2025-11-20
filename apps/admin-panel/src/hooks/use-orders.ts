import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { OrderListResponse, OrderResponse, CreateOrderRequest, UpdateOrderRequest } from '@/types/order';

export const useOrders = (page: number = 1, limit: number = 10, search?: string) => {
  return useQuery<OrderListResponse>({
    queryKey: ['orders', page, limit, search],
    queryFn: () => apiClient.get(`/api/sales/orders?page=${page}&limit=${limit}&search=${search}`),
  });
};

export const useOrder = (id: number) => {
  return useQuery<OrderResponse>({
    queryKey: ['order', id],
    queryFn: () => apiClient.get(`/api/sales/orders/${id}`),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => apiClient.post('/api/sales/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderRequest }) => 
      apiClient.put(`/api/sales/orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/sales/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
