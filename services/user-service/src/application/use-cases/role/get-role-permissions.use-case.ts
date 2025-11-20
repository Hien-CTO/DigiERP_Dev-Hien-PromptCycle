import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { PermissionResponseDto } from '../../dtos/permission.dto';

export class RolePermissionsResponseDto {
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  permissions: PermissionResponseDto[];
}

@Injectable()
export class GetRolePermissionsUseCase {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(roleId: number): Promise<RolePermissionsResponseDto> {
    // Check if role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Get permissions for this role
    const permissions = await this.permissionRepository.findRolePermissions(roleId);

    return {
      roleId: role.id,
      roleName: role.name,
      roleDisplayName: role.displayName,
      permissions: permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        displayName: permission.displayName,
        description: permission.description,
        resourceId: permission.resourceId,
        actionId: permission.actionId,
        scope: permission.scope,
        tenantId: permission.tenantId,
        isActive: permission.isActive,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      })),
    };
  }
}

