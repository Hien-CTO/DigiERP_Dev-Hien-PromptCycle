import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { UserProfileDto } from '../../dtos/auth.dto';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
  ) {}

  async execute(userId: number): Promise<UserProfileDto> {
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user tenants (primary tenant và tất cả tenants)
    const primaryTenant = await this.userTenantRepository.findPrimaryTenant(userId);
    const allTenants = await this.userTenantRepository.findAllUserTenants(userId);

    // Get user roles from ALL tenants (not just primary tenant)
    // Pass undefined to get all roles from all tenants user belongs to
    // This includes GLOBAL roles and TENANT roles from all tenants
    const roles = await this.roleRepository.findUserRoles(userId, undefined);
    const roleNames = roles.map(role => role.name);
    
    console.log(`[GetUserProfile] Found ${roles.length} roles for user ${userId}:`, roleNames);

    // Get permissions from all roles that user has
    // Fetch permissions for all roles in parallel for better performance
    const rolePermissionsPromises = roles.map(async (role) => {
      const permissions = await this.permissionRepository.findRolePermissions(role.id);
      console.log(`[GetUserProfile] Role ${role.name} (ID: ${role.id}) has ${permissions.length} permissions:`, 
        permissions.map(p => p.name));
      return permissions;
    });
    const allRolePermissions = await Promise.all(rolePermissionsPromises);
    
    // Collect all unique permissions from all roles
    // Don't filter by isActive here - let the repository handle it
    const allPermissions = new Set<string>();
    allRolePermissions.forEach((rolePermissions, index) => {
      const roleName = roles[index].name;
      rolePermissions.forEach(permission => {
        // Only add active permissions
        if (permission.isActive) {
          allPermissions.add(permission.name);
          console.log(`[GetUserProfile] Added permission ${permission.name} from role ${roleName}`);
        } else {
          console.log(`[GetUserProfile] Skipped inactive permission ${permission.name} from role ${roleName}`);
        }
      });
    });
    const permissionStrings = Array.from(allPermissions);
    
    console.log(`[GetUserProfile] Total unique permissions collected: ${permissionStrings.length}`, permissionStrings);

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: roleNames,
      permissions: permissionStrings,
      tenant: primaryTenant ? {
        tenantId: primaryTenant.tenantId,
        tenantCode: primaryTenant.tenantCode,
        tenantName: primaryTenant.tenantName,
        roleId: primaryTenant.roleId,
        roleName: primaryTenant.roleName,
      } : undefined,
      tenants: allTenants.map(t => ({
        tenantId: t.tenantId,
        tenantCode: t.tenantCode,
        tenantName: t.tenantName,
        roleId: t.roleId,
        roleName: t.roleName,
        isPrimary: t.isPrimary,
      })),
    };
  }
}
