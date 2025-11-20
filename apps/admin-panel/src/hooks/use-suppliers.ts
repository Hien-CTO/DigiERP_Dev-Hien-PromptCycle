import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/types/purchase';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<Supplier[]> => {
      const response = await api.get<{ data: Supplier[]; total: number; page: number; limit: number } | Supplier[]>('/api/purchase/suppliers');
      // Handle both paginated response and direct array response
      if (Array.isArray(response)) {
        return response;
      }
      // If response has a data property, extract it
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback to empty array if response format is unexpected
      return [];
    },
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: async (): Promise<Supplier> => {
      const response = await api.get<Supplier>(`/api/purchase/suppliers/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSupplierDto): Promise<Supplier> => {
      const response = await api.post<Supplier>('/api/purchase/suppliers', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierDto }): Promise<Supplier> => {
      const response = await api.patch<Supplier>(`/api/purchase/suppliers/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', id] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/purchase/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};
