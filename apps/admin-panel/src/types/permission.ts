export interface PermissionResponse {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  resourceId: number;
  actionId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionListResponse {
  permissions: PermissionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserPermissionsResponse {
  userId: number;
  roles: string[];
  permissions: string[];
}
