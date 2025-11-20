import { PermissionEntity } from '../entities/permission.entity';

export interface IPermissionRepository {
  findById(id: number): Promise<PermissionEntity | null>;
  findAll(page?: number, limit?: number): Promise<{ permissions: PermissionEntity[]; total: number }>;
  findTenantPermissions(tenantId: number): Promise<PermissionEntity[]>;
  findByResourceAndAction(resourceId: number, actionId: number, scope?: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<PermissionEntity | null>;
  existsByNameAndScope(name: string, scope: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<boolean>;
  findUserPermissions(userId: number, tenantId?: number): Promise<PermissionEntity[]>;
  findRolePermissions(roleId: number): Promise<PermissionEntity[]>;
  create(permission: Omit<PermissionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PermissionEntity>;
  update(id: number, permission: Partial<PermissionEntity>): Promise<PermissionEntity | null>;
  delete(id: number): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  assignPermissionsToRole(roleId: number, permissionIds: number[], grantedBy?: number): Promise<boolean>;
  removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<boolean>;
  checkUserPermission(userId: number, resourceId: number, actionId: number, tenantId?: number): Promise<boolean>;
}
