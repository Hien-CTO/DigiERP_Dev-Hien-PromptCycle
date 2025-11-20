import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { CreatePermissionDto, PermissionResponseDto } from '../../dtos/permission.dto';
import { PermissionEntity } from '@/domain/entities/permission.entity';

@Injectable()
export class CreateTenantPermissionUseCase {
  constructor(
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(
    tenantId: number,
    createPermissionDto: Omit<CreatePermissionDto, 'scope' | 'tenantId'>,
  ): Promise<PermissionResponseDto> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const {
      name,
      displayName,
      description,
      resourceId,
      actionId,
      isActive = true,
    } = createPermissionDto;

    // Check if permission name already exists for this tenant
    const existingPermission = await this.permissionRepository.existsByNameAndScope(name, 'TENANT', tenantId);
    if (existingPermission) {
      throw new ConflictException('Permission name already exists for this tenant');
    }

    // Check if permission with same resource and action already exists for this tenant
    const existingResourceAction = await this.permissionRepository.findByResourceAndAction(resourceId, actionId, 'TENANT', tenantId);
    if (existingResourceAction) {
      throw new ConflictException('Permission with this resource and action combination already exists for this tenant');
    }

    // Create permission entity with TENANT scope
    const permissionEntity = new PermissionEntity(
      0, // id will be set by database
      name,
      displayName,
      resourceId,
      actionId,
      description,
      'TENANT', // scope
      tenantId, // tenantId
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

