import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { PermissionResponseDto } from '../../dtos/permission.dto';

@Injectable()
export class GetPermissionUseCase {
  constructor(@Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository) {}

  async execute(permissionId: number): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
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
    };
  }
}
