import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { UpdatePermissionDto, PermissionResponseDto } from '../../dtos/permission.dto';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(@Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository) {}

  async execute(permissionId: number, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    // Check if permission exists
    const existingPermission = await this.permissionRepository.findById(permissionId);
    if (!existingPermission) {
      throw new NotFoundException('Permission not found');
    }

    // Check for name conflicts if name is being updated
    if (updatePermissionDto.name && updatePermissionDto.name !== existingPermission.name) {
      const nameExists = await this.permissionRepository.existsByName(updatePermissionDto.name);
      if (nameExists) {
        throw new ConflictException('Permission name already exists');
      }
    }

    // Check for resource/action conflicts if they are being updated
    if (updatePermissionDto.resourceId && updatePermissionDto.actionId) {
      const resourceId = updatePermissionDto.resourceId;
      const actionId = updatePermissionDto.actionId;
      
      // Only check if both resource and action are different from current
      if (resourceId !== existingPermission.resourceId || actionId !== existingPermission.actionId) {
        const existingResourceAction = await this.permissionRepository.findByResourceAndAction(resourceId, actionId);
        if (existingResourceAction && existingResourceAction.id !== permissionId) {
          throw new ConflictException('Permission with this resource and action combination already exists');
        }
      }
    }

    // Update permission
    const updatedPermission = await this.permissionRepository.update(permissionId, {
      ...updatePermissionDto,
    });

    if (!updatedPermission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      id: updatedPermission.id,
      name: updatedPermission.name,
      displayName: updatedPermission.displayName,
      description: updatedPermission.description,
      resourceId: updatedPermission.resourceId,
      actionId: updatedPermission.actionId,
      scope: updatedPermission.scope,
      tenantId: updatedPermission.tenantId,
      isActive: updatedPermission.isActive,
      createdAt: updatedPermission.createdAt,
      updatedAt: updatedPermission.updatedAt,
    };
  }
}
