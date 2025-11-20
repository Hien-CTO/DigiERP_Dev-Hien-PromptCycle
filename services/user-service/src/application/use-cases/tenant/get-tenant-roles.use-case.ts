import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { RoleListResponseDto } from '../../dtos/role.dto';

@Injectable()
export class GetTenantRolesUseCase {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: number): Promise<RoleListResponseDto> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get all roles for this tenant
    const roles = await this.roleRepository.findTenantRoles(tenantId);

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
      total: roles.length,
    };
  }
}

