export interface CustomerGroup {
  id: string;
  name: string;
  isCompany: boolean;
  color?: string;
  description?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  paymentTerms?: string;
  creditLimit: number;
  notes?: string;
  isActive: boolean;
  salesRep?: string;
  salesRepresentativeId?: number;
  salesRepresentative?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  customerGroupId?: string;
  customerGroup?: CustomerGroup;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  companyCustomers: number;
  companyCustomersActive: number;
  individualCustomers: number;
  individualCustomersActive: number;
  totalGroups: number;
}

export interface CreateCustomerRequest {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  creditLimit?: number;
  salesRep?: string;
  salesRepresentativeId?: number;
  customerGroupId?: string;
  isActive?: boolean;
}

export interface UpdateCustomerRequest {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
  salesRep?: string;
  salesRepresentativeId?: number;
  customerGroupId?: string;
  isActive?: boolean;
}

