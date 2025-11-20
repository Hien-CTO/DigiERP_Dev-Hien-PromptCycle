import { Injectable, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { RoleListResponseDto } from '../../dtos/role.dto';

@Injectable()
export class GetRolesUseCase {
  constructor(@Inject('IRoleRepository') private readonly roleRepository: IRoleRepository) {}

  async execute(page: number = 1, limit: number = 10, search?: string): Promise<RoleListResponseDto> {
    const { roles, total } = await this.roleRepository.findAll(page, limit, search);
    
    return {
      roles: roles.map(role => ({
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
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
