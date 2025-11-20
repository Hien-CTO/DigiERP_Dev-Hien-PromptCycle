import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export enum PricingPolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export interface PricingPolicyDetail {
  id: number;
  pricingPolicyId: number;
  productId: number;
  basePrice: number;
  discountPercentage: number;
  discountedPrice: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface PricingPolicy {
  id: number;
  code: string;
  customerId: string;
  validFrom: string;
  validTo?: string;
  status: PricingPolicyStatus;
  details?: PricingPolicyDetail[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface PricingPolicyListResponse {
  policies: PricingPolicy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePricingPolicyRequest {
  code: string;
  customerId: string;
  validFrom: string;
  validTo?: string;
  status?: PricingPolicyStatus;
  details: {
    productId: number;
    basePrice?: number; // Optional - will be fetched from product_prices if not provided
    discountPercentage: number;
  }[];
}

export interface UpdatePricingPolicyRequest {
  code?: string;
  validFrom?: string;
  validTo?: string;
  status?: PricingPolicyStatus;
  details?: {
    productId: number;
    basePrice?: number; // Optional - will be fetched from product_prices if not provided
    discountPercentage: number;
  }[];
}

export const usePricingPolicies = (
  page: number = 1,
  limit: number = 10,
  customerId?: string,
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (customerId) params.append('customerId', customerId);

  return useQuery<PricingPolicyListResponse>({
    queryKey: ['pricing-policies', page, limit, customerId],
    queryFn: () => apiClient.get(`/api/pricing-policies?${params.toString()}`),
  });
};

export const usePricingPolicy = (id: number) => {
  return useQuery<PricingPolicy>({
    queryKey: ['pricing-policy', id],
    queryFn: () => apiClient.get(`/api/pricing-policies/${id}`),
    enabled: !!id,
  });
};

export const usePricingPoliciesByCustomer = (customerId: string) => {
  return useQuery<PricingPolicy[]>({
    queryKey: ['pricing-policies', 'customer', customerId],
    queryFn: () => apiClient.get(`/api/pricing-policies/customer/${customerId}`),
    enabled: !!customerId,
  });
};

export const useCreatePricingPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePricingPolicyRequest) =>
      apiClient.post('/api/pricing-policies', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-policies'] });
      queryClient.invalidateQueries({
        queryKey: ['pricing-policies', 'customer', variables.customerId],
      });
    },
  });
};

export const useUpdatePricingPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePricingPolicyRequest }) =>
      apiClient.put(`/api/pricing-policies/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-policies'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-policy', variables.id] });
    },
  });
};

export const useDeletePricingPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/pricing-policies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-policies'] });
    },
  });
};

