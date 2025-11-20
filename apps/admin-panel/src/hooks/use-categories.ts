import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { CategoryListResponse, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export const useCategories = (page: number = 1, limit: number = 10, ) => {
  return useQuery<CategoryListResponse>({
    queryKey: ['categories', page, limit],
    queryFn: () => apiClient.get(`/api/products/categories?page=${page}&limit=${limit}`),
  });
};

export const useCategory = (id: number) => {
  return useQuery<CategoryResponse>({
    queryKey: ['category', id],
    queryFn: () => apiClient.get(`/api/products/categories/${id}`),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => apiClient.post('/api/products/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) => 
      apiClient.put(`/api/products/categories/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/products/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
