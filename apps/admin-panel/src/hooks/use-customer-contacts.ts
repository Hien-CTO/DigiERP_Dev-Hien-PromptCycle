import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface CustomerContact {
  id: number;
  customerId: string;
  title: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  notes?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  zaloUrl?: string | null;
}

export interface CreateCustomerContactDto {
  customerId: string;
  title: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  notes?: string;
  isPrimary?: boolean;
}

export interface UpdateCustomerContactDto {
  title?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

// Hook để lấy danh sách contacts của một customer
export function useCustomerContacts(customerId: string) {
  return useQuery<CustomerContact[]>({
    queryKey: ['customer-contacts', customerId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/customers/${customerId}/contacts`);
      return response.data || [];
    },
    enabled: !!customerId,
  });
}

// Hook để lấy một contact cụ thể
export function useCustomerContact(customerId: string, contactId: number) {
  return useQuery<CustomerContact>({
    queryKey: ['customer-contact', customerId, contactId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/customers/${customerId}/contacts/${contactId}`);
      return response.data;
    },
    enabled: !!customerId && !!contactId,
  });
}

// Hook để tạo contact mới
export function useCreateCustomerContact(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateCustomerContactDto, 'customerId'>) => {
      const response = await apiClient.post(`/api/customers/${customerId}/contacts`, {
        ...data,
        customerId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-contacts', customerId] });
    },
  });
}

// Hook để cập nhật contact
export function useUpdateCustomerContact(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateCustomerContactDto) => {
      const response = await apiClient.put(`/api/customers/${customerId}/contacts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-contacts', customerId] });
    },
  });
}

// Hook để xóa contact
export function useDeleteCustomerContact(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: number) => {
      await apiClient.delete(`/api/customers/${customerId}/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-contacts', customerId] });
    },
  });
}

