import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role as RoleEntity, UserRole } from '../entities';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { RoleEntity as DomainRoleEntity } from '@/domain/entities/role.entity';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
  ) {}

  async findById(id: number): Promise<DomainRoleEntity | null> {
    const role = await this.roleRepository.findOne({ where: { id } });
    return role ? this.toDomainEntity(role) : null;
  }

  async findByName(name: string): Promise<DomainRoleEntity | null> {
    const role = await this.roleRepository.findOne({ where: { name } });
    return role ? this.toDomainEntity(role) : null;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ roles: DomainRoleEntity[]; total: number }> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Apply search filter if provided
    if (search && search.trim()) {
      queryBuilder.where(
        '(role.name LIKE :search OR role.display_name LIKE :search OR role.description LIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Apply pagination
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('role.created_at', 'DESC');

    const [roles, total] = await queryBuilder.getManyAndCount();

    return {
      roles: roles.map(role => this.toDomainEntity(role)),
      total,
    };
  }

  async create(role: Omit<DomainRoleEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DomainRoleEntity> {
    const roleEntity = this.roleRepository.create({
      name: role.name,
      display_name: role.displayName,
      description: role.description,
      is_system_role: role.isSystemRole,
      scope: role.scope || 'GLOBAL',
      tenant_id: role.tenantId || null,
      is_active: role.isActive,
    });

    const savedRole = await this.roleRepository.save(roleEntity);
    return this.toDomainEntity(savedRole);
  }

  async update(id: number, role: Partial<DomainRoleEntity>): Promise<DomainRoleEntity | null> {
    const updateData: any = {};
    
    if (role.name) updateData.name = role.name;
    if (role.displayName) updateData.display_name = role.displayName;
    if (role.description !== undefined) updateData.description = role.description;
    if (role.isActive !== undefined) updateData.is_active = role.isActive;

    await this.roleRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { name } });
    return count > 0;
  }

  async existsByNameAndScope(name: string, scope: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<boolean> {
    const where: any = { name, scope };
    if (scope === 'TENANT' && tenantId) {
      where.tenant_id = tenantId;
    } else if (scope === 'GLOBAL') {
      where.tenant_id = null;
    }
    const count = await this.roleRepository.count({ where });
    return count > 0;
  }

  async findByNameAndScope(name: string, scope: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<DomainRoleEntity | null> {
    const where: any = { name, scope };
    if (scope === 'TENANT' && tenantId) {
      where.tenant_id = tenantId;
    } else if (scope === 'GLOBAL') {
      where.tenant_id = null;
    }
    const role = await this.roleRepository.findOne({ where });
    return role ? this.toDomainEntity(role) : null;
  }

  async findTenantRoles(tenantId: number): Promise<DomainRoleEntity[]> {
    const roles = await this.roleRepository.find({
      where: {
        tenant_id: tenantId,
        scope: 'TENANT',
        is_active: true,
      },
      order: { created_at: 'DESC' },
    });

    return roles.map(role => this.toDomainEntity(role));
  }

  async findUserRoles(userId: number, tenantId?: number): Promise<DomainRoleEntity[]> {
    const roles: DomainRoleEntity[] = [];

    // 1. Get GLOBAL roles from user_roles (only GLOBAL scope roles)
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['role'],
    });

    console.log(`[RoleRepository] Found ${userRoles.length} user_roles records for user ${userId}`);

    const globalRoles = userRoles
      .filter(userRole => {
        if (!userRole.role) {
          console.log(`[RoleRepository] Warning: user_role ${userRole.id} has no role relation`);
          return false;
        }
        if (!userRole.role.is_active) {
          console.log(`[RoleRepository] Skipped inactive role ${userRole.role.name} (ID: ${userRole.role.id})`);
          return false;
        }
        if (userRole.role.scope !== 'GLOBAL') {
          console.log(`[RoleRepository] Skipped non-GLOBAL role ${userRole.role.name} (scope: ${userRole.role.scope})`);
          return false;
        }
        return true;
      })
      .map(userRole => this.toDomainEntity(userRole.role));
    
    console.log(`[RoleRepository] Found ${globalRoles.length} GLOBAL roles:`, globalRoles.map(r => r.name));
    roles.push(...globalRoles);

    // 2. Get TENANT roles from user_tenants
    try {
      const userTenants = tenantId 
        ? [await this.userTenantRepository.findUserTenant(userId, tenantId)].filter(Boolean)
        : await this.userTenantRepository.findAllUserTenants(userId);

      console.log(`[RoleRepository] Found ${userTenants.length} user_tenants for user ${userId}${tenantId ? ` (filtered by tenantId: ${tenantId})` : ' (all tenants)'}`);

      for (const userTenant of userTenants) {
        console.log(`[RoleRepository] Processing user_tenant: tenantId=${userTenant.tenantId}, roleId=${userTenant.roleId}, roleName=${userTenant.roleName}`);
        
        const role = await this.roleRepository.findOne({ 
          where: { id: userTenant.roleId },
        });
        
        if (!role) {
          console.log(`[RoleRepository] Warning: Role with ID ${userTenant.roleId} not found in database`);
          continue;
        }
        
        if (!role.is_active) {
          console.log(`[RoleRepository] Skipped inactive role ${role.name} (ID: ${role.id})`);
          continue;
        }
        
        console.log(`[RoleRepository] Adding TENANT role ${role.name} (ID: ${role.id}, scope: ${role.scope})`);
        roles.push(this.toDomainEntity(role));
      }
    } catch (error) {
      // Handle case when user_tenants table doesn't exist or user has no tenants
      console.warn(`[RoleRepository] Warning: Could not fetch tenant roles for user ${userId}:`, error.message);
    }

    console.log(`[RoleRepository] Total roles found for user ${userId}: ${roles.length}`, roles.map(r => `${r.name} (${r.scope})`));
    return roles;
  }

  async assignRoleToUser(userId: number, roleId: number, assignedBy?: number): Promise<boolean> {
    try {
      const userRole = this.userRoleRepository.create({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
        is_active: true,
      });

      await this.userRoleRepository.save(userRole);
      return true;
    } catch (error) {
      // Handle duplicate key error
      return false;
    }
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    const result = await this.userRoleRepository.delete({
      user_id: userId,
      role_id: roleId,
    });
    return result.affected > 0;
  }

  private toDomainEntity(role: RoleEntity): DomainRoleEntity {
    return new DomainRoleEntity(
      role.id,
      role.name,
      role.display_name,
      role.description,
      role.is_system_role,
      role.scope,
      role.tenant_id || undefined,
      role.is_active,
      role.created_at,
      role.updated_at,
    );
  }
}
