import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { UpdateUserDto, UserResponseDto } from '../../dtos/user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserTenantRepository') private readonly userTenantRepository: IUserTenantRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: number, updateUserDto: UpdateUserDto, avatarUrl?: string): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const {
      username,
      email,
      firstName,
      lastName,
      phone,
      isActive,
      isVerified,
      tenantId,
      roleId,
      isPrimary,
    } = updateUserDto;

    // Check if username already exists (if changed)
    if (username && username !== existingUser.username) {
      const existingUserByUsername = await this.userRepository.existsByUsername(username);
      if (existingUserByUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check if email already exists (if changed)
    if (email && email !== existingUser.email) {
      const existingUserByEmail = await this.userRepository.existsByEmail(email);
      if (existingUserByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Validate tenant assignment if provided
    if (tenantId !== undefined) {
      if (tenantId !== null && !roleId) {
        throw new BadRequestException('Role ID is required when assigning user to a tenant');
      }

      if (tenantId !== null) {
        // Check if tenant exists
        const tenant = await this.tenantRepository.findById(tenantId);
        if (!tenant) {
          throw new NotFoundException('Tenant not found');
        }

        // Check if role exists
        const role = await this.roleRepository.findById(roleId!);
        if (!role) {
          throw new NotFoundException('Role not found');
        }
      }
    }

    // Prepare update data - use plain object since UserEntity properties are readonly
    const updateData: {
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string;
      isActive?: boolean;
      isVerified?: boolean;
    } = {};
    
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    // Update user - use type assertion because UserEntity properties are readonly
    // but repository implementation accepts plain objects
    const updatedUser = await this.userRepository.update(userId, updateData as any);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    // Handle tenant assignment if provided
    if (tenantId !== undefined && roleId !== undefined) {
      try {
        if (tenantId === null) {
          // Remove user from tenant (if needed)
          // This depends on your business logic - you might want to remove all tenant assignments
          // or just specific ones. For now, we'll skip removal.
        } else {
          // Check if user is already assigned to this tenant
          const existingAssignment = await this.userTenantRepository.findUserTenant(userId, tenantId);
          
          if (existingAssignment) {
            // Update existing assignment role
            await this.userTenantRepository.updateUserTenantRole(
              userId,
              tenantId,
              roleId,
            );
            
            // Set primary tenant if specified
            if (isPrimary === true) {
              await this.userTenantRepository.setPrimaryTenant(userId, tenantId);
            }
          } else {
            // Create new assignment
            await this.userTenantRepository.assignUserToTenant(
              userId,
              tenantId,
              roleId,
              isPrimary ?? false,
              undefined, // invitedBy - can be added later if needed
            );
          }
        }
      } catch (error) {
        // If assignment fails, log error but don't fail user update
        console.error(`Failed to update tenant assignment for user ${userId}:`, error);
      }
    }

    // Get tenant information for response
    let primaryTenant = null;
    let tenants = [];

    try {
      primaryTenant = await this.userTenantRepository.findPrimaryTenant(userId);
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
      console.warn(`Failed to fetch tenant information for user ${userId}:`, error);
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      avatarUrl: updatedUser.avatarUrl,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.isVerified,
      lastLoginAt: updatedUser.lastLoginAt,
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
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}

