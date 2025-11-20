import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { PermissionListResponseDto } from '../../dtos/permission.dto';

@Injectable()
export class GetTenantPermissionsUseCase {
  constructor(
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: number): Promise<PermissionListResponseDto> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get all permissions for this tenant
    const permissions = await this.permissionRepository.findTenantPermissions(tenantId);

    return {
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
      total: permissions.length,
    };
  }
}

