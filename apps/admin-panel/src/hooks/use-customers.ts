import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { 
  CustomerListResponse, 
  Customer, 
  CustomerStatistics,
  CreateCustomerRequest, 
  UpdateCustomerRequest 
} from '@/types/customer';

export const useCustomers = (
  page: number = 1, 
  limit: number = 50, 
  search?: string,
  customerGroupId?: string,
  salesRepresentativeId?: number,
  status?: 'all' | 'active' | 'inactive'
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (customerGroupId) params.append('customerGroupId', customerGroupId);
  if (salesRepresentativeId) params.append('salesRepresentativeId', salesRepresentativeId.toString());
  if (status && status !== 'all') params.append('status', status);

  return useQuery<CustomerListResponse>({
    queryKey: ['customers', page, limit, search, customerGroupId, salesRepresentativeId, status],
    queryFn: async () => {
      // Backend returns array directly, so we need to adapt it to paginated format
      const customers = await apiClient.get<Customer[]>(`/api/customers?${params.toString()}`);
      
      // Apply filters client-side if backend doesn't support them
      let filtered = Array.isArray(customers) ? customers : [];
      
      // Filter by customer group
      if (customerGroupId) {
        filtered = filtered.filter(c => c.customerGroupId === customerGroupId);
      }
      
      // Filter by sales rep
      if (salesRepresentativeId) {
        filtered = filtered.filter(c => c.salesRepresentativeId === salesRepresentativeId);
      }
      
      // Filter by status
      if (status === 'active') {
        filtered = filtered.filter(c => c.isActive === true);
      } else if (status === 'inactive') {
        filtered = filtered.filter(c => c.isActive === false);
      }
      
      // Apply pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedCustomers = filtered.slice(startIndex, startIndex + limit);
      
      return {
        customers: paginatedCustomers,
        total,
        page,
        limit,
        totalPages,
      };
    },
  });
};

export const useCustomer = (id: string) => {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => apiClient.get(`/api/customers/${id}`),
    enabled: !!id,
  });
};

export const useCustomerStatistics = () => {
  return useQuery<CustomerStatistics>({
    queryKey: ['customer-statistics'],
    queryFn: () => apiClient.get('/api/customers/statistics'),
  });
};

export const useCustomerGroups = () => {
  return useQuery<Array<{ id: string; name: string; isCompany: boolean; color?: string; isActive: boolean }>>({
    queryKey: ['customer-groups'],
    queryFn: () => apiClient.get('/api/customers/groups'),
  });
};

export const useSalesRepresentatives = () => {
  return useQuery<Array<{ id: number; firstName: string; lastName: string; username: string }>>({
    queryKey: ['sales-representatives'],
    queryFn: () => apiClient.get('/api/users?role=sales'),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => apiClient.post('/api/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-statistics'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) => 
      apiClient.put(`/api/customers/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customer-statistics'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-statistics'] });
    },
  });
};

