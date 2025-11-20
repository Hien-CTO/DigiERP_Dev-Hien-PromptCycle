import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { CreateRoleDto, RoleResponseDto } from '../../dtos/role.dto';
import { RoleEntity } from '@/domain/entities/role.entity';

@Injectable()
export class CreateRoleUseCase {
  constructor(@Inject('IRoleRepository') private readonly roleRepository: IRoleRepository) {}

  async execute(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const {
      name,
      displayName,
      description,
      isSystemRole = false,
      scope = 'TENANT', // Default to TENANT scope
      tenantId,
      isActive = true,
    } = createRoleDto;

    // Enforce rule: Only TENANT scope is allowed, tenantId is required
    if (scope === 'GLOBAL') {
      throw new ConflictException('GLOBAL scope is not allowed. All roles must have TENANT scope and belong to a tenant.');
    }
    
    if (!tenantId) {
      throw new ConflictException('Tenant ID is required. All roles must belong to a tenant.');
    }

    // Check if role name already exists in the same scope and tenant
    const existingRole = await this.roleRepository.existsByNameAndScope(name, scope, tenantId);
    if (existingRole) {
      throw new ConflictException(`Role name already exists for ${scope} scope${tenantId ? ` in tenant ${tenantId}` : ''}`);
    }

    // Create role entity
    const roleEntity = new RoleEntity(
      0, // id will be set by database
      name,
      displayName,
      description,
      isSystemRole,
      scope,
      tenantId,
      isActive,
      new Date(), // createdAt
      new Date(), // updatedAt
    );

    // Save role
    const createdRole = await this.roleRepository.create(roleEntity);

    return {
      id: createdRole.id,
      name: createdRole.name,
      displayName: createdRole.displayName,
      description: createdRole.description,
      isSystemRole: createdRole.isSystemRole,
      scope: createdRole.scope,
      tenantId: createdRole.tenantId,
      isActive: createdRole.isActive,
      createdAt: createdRole.createdAt,
      updatedAt: createdRole.updatedAt,
    };
  }
}
