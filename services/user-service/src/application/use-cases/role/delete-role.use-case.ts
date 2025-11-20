import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';

@Injectable()
export class DeleteRoleUseCase {
  constructor(@Inject('IRoleRepository') private readonly roleRepository: IRoleRepository) {}

  async execute(roleId: number): Promise<void> {
    // Check if role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role can be deleted
    if (!role.canBeDeleted()) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    // Delete role
    const deleted = await this.roleRepository.delete(roleId);
    if (!deleted) {
      throw new NotFoundException('Role not found');
    }
  }
}
