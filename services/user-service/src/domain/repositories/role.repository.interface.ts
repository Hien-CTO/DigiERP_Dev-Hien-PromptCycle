import { RoleEntity } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: number): Promise<RoleEntity | null>;
  findByName(name: string): Promise<RoleEntity | null>;
  findAll(page?: number, limit?: number, search?: string): Promise<{ roles: RoleEntity[]; total: number }>;
  findTenantRoles(tenantId: number): Promise<RoleEntity[]>;
  existsByNameAndScope(name: string, scope: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<boolean>;
  findByNameAndScope(name: string, scope: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<RoleEntity | null>;
  create(role: Omit<RoleEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleEntity>;
  update(id: number, role: Partial<RoleEntity>): Promise<RoleEntity | null>;
  delete(id: number): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  findUserRoles(userId: number, tenantId?: number): Promise<RoleEntity[]>;
  assignRoleToUser(userId: number, roleId: number, assignedBy?: number): Promise<boolean>;
  removeRoleFromUser(userId: number, roleId: number): Promise<boolean>;
}
