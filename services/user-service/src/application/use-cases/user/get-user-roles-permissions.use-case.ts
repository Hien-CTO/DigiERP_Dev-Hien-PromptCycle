import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { UserRolesWithPermissionsResponseDto, RoleWithPermissionsDto } from '../../dtos/user-roles-permissions.dto';

@Injectable()
export class GetUserRolesWithPermissionsUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(userId: number, tenantId?: number): Promise<UserRolesWithPermissionsResponseDto> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user roles (with tenant context if provided)
    const roles = await this.roleRepository.findUserRoles(userId, tenantId);

    // Get permissions for each role
    const rolesWithPermissions: RoleWithPermissionsDto[] = await Promise.all(
      roles.map(async (role) => {
        const permissions = await this.permissionRepository.findRolePermissions(role.id);
        
        return {
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          isSystemRole: role.isSystemRole,
          isActive: role.isActive,
          permissions: permissions.map(p => p.name),
        };
      })
    );

    // Collect all unique permissions
    const allPermissionsSet = new Set<string>();
    rolesWithPermissions.forEach(role => {
      role.permissions.forEach(permission => {
        allPermissionsSet.add(permission);
      });
    });

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      roles: rolesWithPermissions,
      allPermissions: Array.from(allPermissionsSet),
    };
  }
}

