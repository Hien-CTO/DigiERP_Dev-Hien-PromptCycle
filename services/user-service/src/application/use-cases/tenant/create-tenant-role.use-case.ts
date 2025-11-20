import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { CreateRoleDto, RoleResponseDto } from '../../dtos/role.dto';
import { RoleEntity } from '@/domain/entities/role.entity';

@Injectable()
export class CreateTenantRoleUseCase {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: number, createRoleDto: Omit<CreateRoleDto, 'scope' | 'tenantId'>): Promise<RoleResponseDto> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const {
      name,
      displayName,
      description,
      isSystemRole = false,
      isActive = true,
    } = createRoleDto;

    // Check if role name already exists for this tenant
    const existingRole = await this.roleRepository.existsByNameAndScope(name, 'TENANT', tenantId);
    if (existingRole) {
      throw new ConflictException(`Role name already exists for this tenant`);
    }

    // Create role entity with TENANT scope
    const roleEntity = new RoleEntity(
      0, // id will be set by database
      name,
      displayName,
      description,
      isSystemRole,
      'TENANT', // scope
      tenantId, // tenantId
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

