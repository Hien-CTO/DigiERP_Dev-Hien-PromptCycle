export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
  tenantId?: number;
  roleId?: number;
  isPrimary?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
  tenantId?: number;
  roleId?: number;
  isPrimary?: boolean;
}

export interface TenantInfo {
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  roleId?: number;
  roleName?: string;
  isPrimary?: boolean;
  joinedAt?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  primaryTenant?: TenantInfo;
  tenants?: TenantInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
