export interface TenantResponse {
  id: number;
  code: string;
  name: string;
  displayName: string;
  description?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityId?: number;
  provinceId?: number;
  countryId?: number;
  logoUrl?: string;
  website?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionExpiresAt?: string;
  maxUsers?: number;
  maxStorageGb?: number;
  settings?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantListResponse {
  tenants: TenantResponse[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateTenantRequest {
  code: string;
  name: string;
  displayName: string;
  description?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityId?: number;
  provinceId?: number;
  countryId?: number;
  logoUrl?: string;
  website?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionExpiresAt?: string;
  maxUsers?: number;
  maxStorageGb?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateTenantRequest {
  code?: string;
  name?: string;
  displayName?: string;
  description?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityId?: number;
  provinceId?: number;
  countryId?: number;
  logoUrl?: string;
  website?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionExpiresAt?: string;
  maxUsers?: number;
  maxStorageGb?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
}

