import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission as PermissionEntity, RolePermission, UserRole } from '../entities';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { PermissionEntity as DomainPermissionEntity } from '@/domain/entities/permission.entity';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async findById(id: number): Promise<DomainPermissionEntity | null> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    return permission ? this.toDomainEntity(permission) : null;
  }

  async findAll(): Promise<{ permissions: DomainPermissionEntity[]; total: number }> {
    const [permissions, total] = await this.permissionRepository.findAndCount({
      order: { created_at: 'DESC' },
    });

    return {
      permissions: permissions.map(permission => this.toDomainEntity(permission)),
      total,
    };
  }

  async findByResourceAndAction(
    resourceId: number,
    actionId: number,
    scope?: 'GLOBAL' | 'TENANT',
    tenantId?: number,
  ): Promise<DomainPermissionEntity | null> {
    const where: any = { resource_id: resourceId, action_id: actionId };
    if (scope) {
      where.scope = scope;
    }
    if (scope === 'TENANT' && tenantId) {
      where.tenant_id = tenantId;
    } else if (scope === 'GLOBAL') {
      where.tenant_id = null;
    }
    const permission = await this.permissionRepository.findOne({ where });
    return permission ? this.toDomainEntity(permission) : null;
  }

  async findTenantPermissions(tenantId: number): Promise<DomainPermissionEntity[]> {
    const permissions = await this.permissionRepository.find({
      where: {
        tenant_id: tenantId,
        scope: 'TENANT',
        is_active: true,
      },
      order: { created_at: 'DESC' },
    });

    return permissions.map(permission => this.toDomainEntity(permission));
  }

  async existsByNameAndScope(name: string, scope: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<boolean> {
    const where: any = { name, scope };
    if (scope === 'TENANT' && tenantId) {
      where.tenant_id = tenantId;
    } else if (scope === 'GLOBAL') {
      where.tenant_id = null;
    }
    const count = await this.permissionRepository.count({ where });
    return count > 0;
  }

  async findUserPermissions(userId: number, tenantId?: number): Promise<DomainPermissionEntity[]> {
    const roleIds: number[] = [];

    // 1. Get GLOBAL roles from user_roles (only GLOBAL scope roles)
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['role'],
    });

    const globalRoleIds = userRoles
      .filter(userRole => userRole.role && userRole.role.is_active && userRole.role.scope === 'GLOBAL')
      .map(userRole => userRole.role.id);
    roleIds.push(...globalRoleIds);

    // 2. Get TENANT roles from user_tenants
    try {
      const userTenants = await this.userTenantRepository.findAllUserTenants(userId);

      if (tenantId) {
        // Only get role of the specific tenant
        const userTenant = userTenants.find(ut => ut.tenantId === tenantId);
        if (userTenant) {
          roleIds.push(userTenant.roleId);
        }
      } else {
        // Get all tenant roles
        const tenantRoleIds = userTenants.map(ut => ut.roleId);
        roleIds.push(...tenantRoleIds);
      }
    } catch (error) {
      // Handle case when user_tenants table doesn't exist or user has no tenants
      console.warn(`Warning: Could not fetch tenant roles for user ${userId}:`, error.message);
    }

    if (roleIds.length === 0) {
      return [];
    }

    // 3. Get permissions for all roles
    const rolePermissions = await this.rolePermissionRepository.find({
      where: roleIds.map(roleId => ({ role_id: roleId })),
      relations: ['permission'],
    });

    // 4. Filter permissions based on scope and tenantId
    let permissions = rolePermissions
      .filter(rp => rp.permission && rp.permission.is_active)
      .map(rp => this.toDomainEntity(rp.permission));

    if (tenantId) {
      // Only include GLOBAL permissions or TENANT permissions of the specific tenant
      permissions = permissions.filter(p => 
        p.scope === 'GLOBAL' || (p.scope === 'TENANT' && p.tenantId === tenantId)
      );
    }

    // Remove duplicates
    const uniquePermissions = permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions;
  }

  async findRolePermissions(roleId: number): Promise<DomainPermissionEntity[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role_id: roleId },
      relations: ['permission'],
    });

    console.log(`[PermissionRepository] Found ${rolePermissions.length} role_permissions for roleId ${roleId}`);

    const filteredPermissions = rolePermissions
      .filter(rp => {
        if (!rp.permission) {
          console.log(`[PermissionRepository] Warning: role_permission ${rp.id} has no permission relation`);
          return false;
        }
        if (!rp.permission.is_active) {
          console.log(`[PermissionRepository] Skipped inactive permission ${rp.permission.name} (ID: ${rp.permission.id})`);
          return false;
        }
        return true;
      })
      .map(rp => this.toDomainEntity(rp.permission));

    console.log(`[PermissionRepository] Returning ${filteredPermissions.length} active permissions for roleId ${roleId}`);
    return filteredPermissions;
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[], grantedBy?: number): Promise<boolean> {
    try {
      // First, remove all existing permissions for this role
      await this.rolePermissionRepository.delete({ role_id: roleId });

      // Then, add the new permissions (only if there are any)
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId =>
          this.rolePermissionRepository.create({
            role_id: roleId,
            permission_id: permissionId,
            granted_by: grantedBy,
          })
        );

        await this.rolePermissionRepository.save(rolePermissions);
      }

      return true;
    } catch (error) {
      console.error('Error assigning permissions to role:', error);
      return false;
    }
  }

  async removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<boolean> {
    try {
      await this.rolePermissionRepository.delete({
        role_id: roleId,
        permission_id: permissionIds.length === 1 ? permissionIds[0] : undefined,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkUserPermission(userId: number, resourceId: number, actionId: number, tenantId?: number): Promise<boolean> {
    // Get user permissions first (this will handle both GLOBAL and TENANT roles)
    const userPermissions = await this.findUserPermissions(userId, tenantId);
    
    // Check if any permission matches the resource and action
    return userPermissions.some(p => 
      p.resourceId === resourceId && 
      p.actionId === actionId
    );
  }

  async create(permission: Omit<DomainPermissionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DomainPermissionEntity> {
    const permissionEntity = this.permissionRepository.create({
      name: permission.name,
      display_name: permission.displayName,
      description: permission.description,
      resource_id: permission.resourceId,
      action_id: permission.actionId,
      scope: permission.scope || 'GLOBAL',
      tenant_id: permission.tenantId || null,
      is_active: permission.isActive,
    });

    const savedPermission = await this.permissionRepository.save(permissionEntity);
    return this.toDomainEntity(savedPermission);
  }

  async update(id: number, permission: Partial<DomainPermissionEntity>): Promise<DomainPermissionEntity | null> {
    const updateData: any = {};
    
    if (permission.name) updateData.name = permission.name;
    if (permission.displayName) updateData.display_name = permission.displayName;
    if (permission.description !== undefined) updateData.description = permission.description;
    if (permission.resourceId) updateData.resource_id = permission.resourceId;
    if (permission.actionId) updateData.action_id = permission.actionId;
    if (permission.isActive !== undefined) updateData.is_active = permission.isActive;

    await this.permissionRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.permissionRepository.delete(id);
    return result.affected > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.permissionRepository.count({ where: { name } });
    return count > 0;
  }
  private toDomainEntity(permission: PermissionEntity): DomainPermissionEntity {
    return new DomainPermissionEntity(
      permission.id,
      permission.name,
      permission.display_name,
      permission.resource_id,
      permission.action_id,
      permission.description,
      permission.scope || 'GLOBAL',
      permission.tenant_id || undefined,
      permission.is_active,
      permission.created_at,
      permission.updated_at,
    );
  }
}
