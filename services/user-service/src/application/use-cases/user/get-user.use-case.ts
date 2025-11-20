import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { UserResponseDto } from '../../dtos/user.dto';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserTenantRepository') private readonly userTenantRepository: IUserTenantRepository,
  ) {}

  async execute(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get tenant information
    let primaryTenant = null;
    let tenants = [];

    try {
      // Get primary tenant
      primaryTenant = await this.userTenantRepository.findPrimaryTenant(userId);
      
      // Get all tenants
      const allTenants = await this.userTenantRepository.findAllUserTenants(userId);
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
      console.warn(`Failed to fetch tenant information for user ${userId}:`, error);
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
  }
}
