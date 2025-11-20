import { Injectable, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { PermissionListResponseDto } from '../../dtos/permission.dto';

@Injectable()
export class GetPermissionsUseCase {
  constructor(@Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository) {}

  async execute(scope?: 'GLOBAL' | 'TENANT', tenantId?: number): Promise<PermissionListResponseDto> {
    let { permissions, total } = await this.permissionRepository.findAll();
    
    // Filter by scope if provided
    if (scope) {
      permissions = permissions.filter(permission => permission.scope === scope);
      total = permissions.length;
    }
    
    // Filter by tenantId if provided (only for TENANT scope)
    if (tenantId !== undefined) {
      permissions = permissions.filter(permission => 
        permission.scope === 'TENANT' && permission.tenantId === tenantId
      );
      total = permissions.length;
    }

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
      total,
    };
  }
}
