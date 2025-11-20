import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { RoleResponseDto } from '../../dtos/role.dto';

@Injectable()
export class GetRoleUseCase {
  constructor(@Inject('IRoleRepository') private readonly roleRepository: IRoleRepository) {}

  async execute(roleId: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystemRole: role.isSystemRole,
      scope: role.scope,
      tenantId: role.tenantId,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
