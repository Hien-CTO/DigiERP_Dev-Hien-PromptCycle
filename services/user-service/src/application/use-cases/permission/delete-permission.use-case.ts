import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';

@Injectable()
export class DeletePermissionUseCase {
  constructor(@Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository) {}

  async execute(permissionId: number): Promise<void> {
    // Check if permission exists
    const existingPermission = await this.permissionRepository.findById(permissionId);
    if (!existingPermission) {
      throw new NotFoundException('Permission not found');
    }

    // Delete permission
    const deleted = await this.permissionRepository.delete(permissionId);
    if (!deleted) {
      throw new NotFoundException('Permission not found');
    }
  }
}
