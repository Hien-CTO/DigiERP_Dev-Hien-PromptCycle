import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface PackagingTypeResponse {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
  is_active?: boolean | number;
  sortOrder?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface PackagingTypeListResponse {
  packagingTypes: PackagingTypeResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usePackagingTypes = (page: number = 1, limit: number = 10) => {
  return useQuery<PackagingTypeListResponse>({
    queryKey: ['packagingTypes', page, limit],
    queryFn: () => apiClient.get(`/api/packaging-types?page=${page}&limit=${limit}`),
  });
};

