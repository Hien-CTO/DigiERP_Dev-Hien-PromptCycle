import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { MaterialListResponse, MaterialResponse } from '@/types/material';

export const useMaterials = (page: number = 1, limit: number = 10) => {
  return useQuery<MaterialListResponse>({
    queryKey: ['materials', page, limit],
    queryFn: () => apiClient.get(`/api/products/materials?page=${page}&limit=${limit}`),
  });
};

export const useMaterial = (id: number) => {
  return useQuery<MaterialResponse>({
    queryKey: ['material', id],
    queryFn: () => apiClient.get(`/api/products/materials/${id}`),
    enabled: !!id,
  });
};

