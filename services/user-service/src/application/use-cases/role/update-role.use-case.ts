import { Injectable, NotFoundException, ConflictException, ForbiddenException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { UpdateRoleDto, RoleResponseDto } from '../../dtos/role.dto';

@Injectable()
export class UpdateRoleUseCase {
  constructor(@Inject('IRoleRepository') private readonly roleRepository: IRoleRepository) {}

  async execute(roleId: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    // Check if role exists
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check if role can be modified
    if (!existingRole.canBeModified()) {
      throw new ForbiddenException('System roles cannot be modified');
    }

    // Check for name conflicts if name is being updated
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const nameExists = await this.roleRepository.existsByName(updateRoleDto.name);
      if (nameExists) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Update role
    const updatedRole = await this.roleRepository.update(roleId, {
      ...updateRoleDto,
    });

    if (!updatedRole) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      displayName: updatedRole.displayName,
      description: updatedRole.description,
      isSystemRole: updatedRole.isSystemRole,
      scope: updatedRole.scope,
      tenantId: updatedRole.tenantId,
      isActive: updatedRole.isActive,
      createdAt: updatedRole.createdAt,
      updatedAt: updatedRole.updatedAt,
    };
  }
}
