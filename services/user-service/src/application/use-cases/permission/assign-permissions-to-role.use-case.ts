import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { AssignPermissionsToRoleDto } from '../../dtos/role.dto';

@Injectable()
export class AssignPermissionsToRoleUseCase {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(roleId: number, assignPermissionsDto: AssignPermissionsToRoleDto, grantedBy?: number): Promise<void> {
    const { permissionIds } = assignPermissionsDto;

    // Check if role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role can be modified
    if (!role.canBeModified()) {
      throw new ForbiddenException('System roles cannot be modified');`  `
    }

    // Validate that all permission IDs exist
    if (permissionIds.length > 0) {
      for (const permissionId of permissionIds) {
        const permission = await this.permissionRepository.findById(permissionId);
        if (!permission) {
          throw new NotFoundException(`Permission with ID ${permissionId} not found`);
        }
      }
    }

    // Assign permissions to role (this will replace existing permissions)
    const success = await this.permissionRepository.assignPermissionsToRole(roleId, permissionIds, grantedBy);
    if (!success) {
      throw new Error('Failed to assign permissions to role');
    }
  }
}
