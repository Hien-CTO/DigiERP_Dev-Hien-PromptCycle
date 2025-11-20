import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { UserListResponseDto } from '../../dtos/user.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserTenantRepository') private readonly userTenantRepository: IUserTenantRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId?: number): Promise<UserListResponseDto> {
    // If tenantId is provided, get users from tenant
    if (tenantId) {
      // Check if tenant exists
      const tenant = await this.tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Get all users in tenant
      const tenantUsers = await this.userTenantRepository.findAllTenantUsers(tenantId);

      // Get unique user IDs to avoid duplicates (a user can have multiple roles in the same tenant)
      const uniqueUserIds = [...new Set(tenantUsers.map(tu => tu.userId))];

      // Convert to UserResponseDto format
      const users = await Promise.all(
        uniqueUserIds.map(async userId => {
          // Get full user information
          const user = await this.userRepository.findById(userId);
          if (!user) {
            return null;
          }

          // Get all tenants for this user
          let primaryTenant = null;
          let tenants = [];

          try {
            primaryTenant = await this.userTenantRepository.findPrimaryTenant(user.id);
            const allTenants = await this.userTenantRepository.findAllUserTenants(user.id);
            tenants = allTenants.map(t => ({
              tenantId: t.tenantId,
              tenantCode: t.tenantCode,
              tenantName: t.tenantName,
              roleId: t.roleId,
              roleName: t.roleName,
              isPrimary: t.isPrimary,
              joinedAt: t.joinedAt,
            }));
          } catch (error) {
            console.warn(`Failed to fetch tenant information for user ${user.id}:`, error);
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            isActive: user.isActive,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            primaryTenant: primaryTenant ? {
              tenantId: primaryTenant.tenantId,
              tenantCode: primaryTenant.tenantCode,
              tenantName: primaryTenant.tenantName,
              roleId: primaryTenant.roleId,
              roleName: primaryTenant.roleName,
              isPrimary: primaryTenant.isPrimary,
              joinedAt: primaryTenant.joinedAt,
            } : undefined,
            tenants: tenants.length > 0 ? tenants : undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        })
      );

      // Filter out null users
      const validUsers = users.filter(user => user !== null);

      return {
        users: validUsers,
        total: validUsers.length,
      };
    }

    // Otherwise, get all users
    const { users, total } = await this.userRepository.findAll();

    // Get tenant information for all users in parallel
    const usersWithTenants = await Promise.all(
      users.map(async user => {
        let primaryTenant = null;
        let tenants = [];

        try {
          // Get primary tenant
          primaryTenant = await this.userTenantRepository.findPrimaryTenant(user.id);
          
          // Get all tenants
          const allTenants = await this.userTenantRepository.findAllUserTenants(user.id);
          tenants = allTenants.map(tenant => ({
            tenantId: tenant.tenantId,
            tenantCode: tenant.tenantCode,
            tenantName: tenant.tenantName,
            roleId: tenant.roleId,
            roleName: tenant.roleName,
            isPrimary: tenant.isPrimary,
            joinedAt: tenant.joinedAt,
          }));
        } catch (error) {
          // If tenant repository fails (e.g., table doesn't exist), just log and continue
          console.warn(`Failed to fetch tenant information for user ${user.id}:`, error);
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
          primaryTenant: primaryTenant ? {
            tenantId: primaryTenant.tenantId,
            tenantCode: primaryTenant.tenantCode,
            tenantName: primaryTenant.tenantName,
            roleId: primaryTenant.roleId,
            roleName: primaryTenant.roleName,
            isPrimary: primaryTenant.isPrimary,
            joinedAt: primaryTenant.joinedAt,
          } : undefined,
          tenants: tenants.length > 0 ? tenants : undefined,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      })
    );

    return {
      users: usersWithTenants,
      total,
    };
  }
}
