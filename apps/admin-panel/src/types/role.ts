export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  isSystemRole?: boolean;
  scope?: 'GLOBAL' | 'TENANT';
  tenantId: number;
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface RoleResponse {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleListResponse {
  roles: RoleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RolePermissionsResponse {
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  permissions: Array<{
    id: number;
    name: string;
    displayName: string;
    description?: string;
    resourceId: number;
    actionId: number;
    scope?: string;
    tenantId?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface AssignRoleToUserRequest {
  roleIds: number[];
}

export interface AssignPermissionsToRoleRequest {
  permissionIds: number[];
}
