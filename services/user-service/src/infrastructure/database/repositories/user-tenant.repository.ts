import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTenant } from '../entities/user-tenant.entity';
import { IUserTenantRepository, UserTenantInfo, UserInfoInTenant } from '@/domain/repositories/user-tenant.repository.interface';

@Injectable()
export class UserTenantRepository implements IUserTenantRepository {
  constructor(
    @InjectRepository(UserTenant)
    private readonly userTenantRepository: Repository<UserTenant>,
  ) {}

  async findPrimaryTenant(userId: number): Promise<UserTenantInfo | null> {
    try {
      const userTenant = await this.userTenantRepository.findOne({
        where: {
          user_id: userId,
          is_primary: true,
          is_active: true,
        },
        relations: ['tenant', 'role'],
      });

      if (!userTenant || !userTenant.tenant || !userTenant.role) {
        return null;
      }

      return this.toUserTenantInfo(userTenant);
    } catch (error: any) {
      // Handle case when table doesn't exist yet (migrations not run)
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return null;
      }
      throw error;
    }
  }

  async findAllUserTenants(userId: number): Promise<UserTenantInfo[]> {
    try {
      const userTenants = await this.userTenantRepository.find({
        where: {
          user_id: userId,
          is_active: true,
        },
        relations: ['tenant', 'role'],
        order: {
          is_primary: 'DESC',
          joined_at: 'DESC',
        },
      });

      return userTenants
        .filter(ut => ut.tenant && ut.role)
        .map(ut => this.toUserTenantInfo(ut));
    } catch (error: any) {
      // Handle case when table doesn't exist yet (migrations not run)
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return [];
      }
      throw error;
    }
  }

  async findUserTenant(userId: number, tenantId: number): Promise<UserTenantInfo | null> {
    try {
      const userTenant = await this.userTenantRepository.findOne({
        where: {
          user_id: userId,
          tenant_id: tenantId,
          is_active: true,
        },
        relations: ['tenant', 'role'],
      });

      if (!userTenant || !userTenant.tenant || !userTenant.role) {
        return null;
      }

      return this.toUserTenantInfo(userTenant);
    } catch (error: any) {
      // Handle case when table doesn't exist yet (migrations not run)
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return null;
      }
      throw error;
    }
  }

  async findAllTenantUsers(tenantId: number): Promise<UserInfoInTenant[]> {
    try {
      const userTenants = await this.userTenantRepository.find({
        where: {
          tenant_id: tenantId,
          is_active: true,
        },
        relations: ['user', 'role'],
        order: {
          is_primary: 'DESC',
          joined_at: 'DESC',
        },
      });

      return userTenants
        .filter(ut => ut.user && ut.role)
        .map(ut => ({
          userId: ut.user.id,
          username: ut.user.username,
          email: ut.user.email,
          firstName: ut.user.first_name,
          lastName: ut.user.last_name,
          roleId: ut.role.id,
          roleName: ut.role.name,
          isPrimary: ut.is_primary,
          joinedAt: ut.joined_at,
          isActive: ut.is_active,
        }));
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return [];
      }
      throw error;
    }
  }

  async assignUserToTenant(
    userId: number,
    tenantId: number,
    roleId: number,
    isPrimary: boolean = false,
    invitedBy?: number,
  ): Promise<UserTenantInfo> {
    try {
      // If setting as primary, unset other primary tenants for this user
      if (isPrimary) {
        await this.userTenantRepository.update(
          { user_id: userId, is_primary: true },
          { is_primary: false },
        );
      }

      // Check if user already has this specific role in this tenant
      // Changed: Check by user_id, tenant_id, AND role_id to support multiple roles per tenant
      const existing = await this.userTenantRepository.findOne({
        where: {
          user_id: userId,
          tenant_id: tenantId,
          role_id: roleId,
        },
      });

      if (existing) {
        // Update existing (only isPrimary and invitedBy can change)
        existing.is_primary = isPrimary;
        existing.is_active = true;
        if (invitedBy) {
          existing.invited_by = invitedBy;
        }

        const updated = await this.userTenantRepository.save(existing);
        return await this.loadRelationsAndReturn(updated);
      }

      // Create new record for this role
      const userTenant = this.userTenantRepository.create({
        user_id: userId,
        tenant_id: tenantId,
        role_id: roleId,
        is_primary: isPrimary,
        invited_by: invitedBy,
        is_active: true,
      });

      const saved = await this.userTenantRepository.save(userTenant);
      return await this.loadRelationsAndReturn(saved);
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        throw new Error('Database table not ready. Please run migrations first.');
      }
      // Handle unique constraint violation (if constraint is still on user_id, tenant_id)
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        console.warn(`⚠️  User ${userId} already has role ${roleId} in tenant ${tenantId}`);
        // Try to find and return existing record
        const existing = await this.userTenantRepository.findOne({
          where: {
            user_id: userId,
            tenant_id: tenantId,
            role_id: roleId,
          },
          relations: ['tenant', 'role'],
        });
        if (existing && existing.tenant && existing.role) {
          return this.toUserTenantInfo(existing);
        }
      }
      throw error;
    }
  }

  async updateUserTenantRole(
    userId: number,
    tenantId: number,
    roleId: number,
  ): Promise<UserTenantInfo | null> {
    try {
      const userTenant = await this.userTenantRepository.findOne({
        where: {
          user_id: userId,
          tenant_id: tenantId,
        },
        relations: ['tenant', 'role'],
      });

      if (!userTenant) {
        return null;
      }

      userTenant.role_id = roleId;
      const updated = await this.userTenantRepository.save(userTenant);
      return await this.loadRelationsAndReturn(updated);
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return null;
      }
      throw error;
    }
  }

  async setPrimaryTenant(userId: number, tenantId: number): Promise<void> {
    try {
      // Unset all primary tenants for this user
      await this.userTenantRepository.update(
        { user_id: userId, is_primary: true },
        { is_primary: false },
      );

      // Set new primary
      await this.userTenantRepository.update(
        { user_id: userId, tenant_id: tenantId },
        { is_primary: true },
      );
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        throw new Error('Database table not ready. Please run migrations first.');
      }
      throw error;
    }
  }

  async removeUserFromTenant(userId: number, tenantId: number): Promise<boolean> {
    try {
      const result = await this.userTenantRepository.delete({
        user_id: userId,
        tenant_id: tenantId,
      });
      return result.affected ? result.affected > 0 : false;
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return false;
      }
      throw error;
    }
  }

  async removeRoleFromUserTenant(userId: number, tenantId: number, roleId: number): Promise<boolean> {
    try {
      const result = await this.userTenantRepository.delete({
        user_id: userId,
        tenant_id: tenantId,
        role_id: roleId,
      });
      return result.affected ? result.affected > 0 : false;
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  user_tenants table does not exist. Please run migrations first.');
        return false;
      }
      throw error;
    }
  }

  async existsUserInTenant(userId: number, tenantId: number): Promise<boolean> {
    try {
      const count = await this.userTenantRepository.count({
        where: {
          user_id: userId,
          tenant_id: tenantId,
        },
      });
      return count > 0;
    } catch (error: any) {
      if (error.message?.includes("doesn't exist") || error.code === 'ER_NO_SUCH_TABLE') {
        return false;
      }
      throw error;
    }
  }

  private async loadRelationsAndReturn(userTenant: UserTenant): Promise<UserTenantInfo> {
    const loaded = await this.userTenantRepository.findOne({
      where: { id: userTenant.id },
      relations: ['tenant', 'role'],
    });

    if (!loaded || !loaded.tenant || !loaded.role) {
      throw new Error('Failed to load tenant or role relations');
    }

    return this.toUserTenantInfo(loaded);
  }

  private toUserTenantInfo(userTenant: UserTenant): UserTenantInfo {
    return {
      tenantId: userTenant.tenant.id,
      tenantCode: userTenant.tenant.code,
      tenantName: userTenant.tenant.name,
      roleId: userTenant.role.id,
      roleName: userTenant.role.name,
      isPrimary: userTenant.is_primary,
      joinedAt: userTenant.joined_at,
    };
  }
}

