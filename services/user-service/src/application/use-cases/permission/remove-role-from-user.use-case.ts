import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';

@Injectable()
export class RemoveRoleFromUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: number, roleId: number): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user has this role (only GLOBAL roles can be removed through this endpoint)
    const userRoles = await this.roleRepository.findUserRoles(userId);
    const hasRole = userRoles.some(r => r.id === roleId && r.scope === 'GLOBAL');

    if (!hasRole) {
      throw new NotFoundException('User does not have this GLOBAL role');
    }

    // Remove role from user
    const removed = await this.roleRepository.removeRoleFromUser(userId, roleId);
    if (!removed) {
      throw new NotFoundException('Failed to remove role from user');
    }

    return {
      message: 'Role removed from user successfully',
    };
  }
}

