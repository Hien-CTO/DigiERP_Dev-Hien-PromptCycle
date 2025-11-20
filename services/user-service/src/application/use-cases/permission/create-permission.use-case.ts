import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { CreatePermissionDto, PermissionResponseDto } from '../../dtos/permission.dto';
import { PermissionEntity } from '@/domain/entities/permission.entity';

@Injectable()
export class CreatePermissionUseCase {
  constructor(@Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository) {}

  async execute(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const {
      name,
      displayName,
      description,
      resourceId,
      actionId,
      scope = 'GLOBAL',
      tenantId,
      isActive = true,
    } = createPermissionDto;

    // Validate scope and tenantId
    if (scope === 'TENANT' && !tenantId) {
      throw new ConflictException('Tenant ID is required for TENANT scope permissions');
    }
    if (scope === 'GLOBAL' && tenantId) {
      throw new ConflictException('Tenant ID cannot be set for GLOBAL scope permissions');
    }

    // Check if permission name already exists in the same scope and tenant
    const existingPermission = await this.permissionRepository.existsByNameAndScope(name, scope, tenantId);
    if (existingPermission) {
      throw new ConflictException(`Permission name already exists for ${scope} scope${tenantId ? ` in tenant ${tenantId}` : ''}`);
    }

    // Check if permission with same resource and action already exists in the same scope
    const existingResourceAction = await this.permissionRepository.findByResourceAndAction(resourceId, actionId, scope, tenantId);
    if (existingResourceAction) {
      throw new ConflictException('Permission with this resource and action combination already exists');
    }

    // Create permission entity
    const permissionEntity = new PermissionEntity(
      0, // id will be set by database
      name,
      displayName,
      resourceId,
      actionId,
      description,
      scope,
      tenantId,
      isActive,
      new Date(), // createdAt
      new Date(), // updatedAt
    );

    // Save permission
    const createdPermission = await this.permissionRepository.create(permissionEntity);

    return {
      id: createdPermission.id,
      name: createdPermission.name,
      displayName: createdPermission.displayName,
      description: createdPermission.description,
      resourceId: createdPermission.resourceId,
      actionId: createdPermission.actionId,
      scope: createdPermission.scope,
      tenantId: createdPermission.tenantId,
      isActive: createdPermission.isActive,
      createdAt: createdPermission.createdAt,
      updatedAt: createdPermission.updatedAt,
    };
  }
}
