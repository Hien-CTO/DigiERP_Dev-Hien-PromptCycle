import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface UnitResponse {
  id: number;
  name: string;
  code?: string;
  symbol?: string;
  type?: string;
  isActive?: boolean;
  is_active?: boolean | number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface UnitListResponse {
  units: UnitResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useUnits = (page: number = 1, limit: number = 10) => {
  return useQuery<UnitListResponse>({
    queryKey: ['units', page, limit],
    queryFn: () => apiClient.get(`/api/units?page=${page}&limit=${limit}`),
  });
};

