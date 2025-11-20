import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { RoleResponseDto } from '../../dtos/role.dto';

@Injectable()
export class GetUserRolesUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: number, tenantId?: number): Promise<{ roles: RoleResponseDto[] }> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user roles (with tenant context if provided)
    const roles = await this.roleRepository.findUserRoles(userId, tenantId);

    return {
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystemRole: role.isSystemRole,
        scope: role.scope,
        tenantId: role.tenantId,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
    };
  }
}

