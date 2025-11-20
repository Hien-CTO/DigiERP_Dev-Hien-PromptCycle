import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { UpdateUserTenantRoleDto, UserTenantResponseDto } from '../../dtos/user-tenant.dto';

@Injectable()
export class UpdateUserTenantRoleUseCase {
  constructor(
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(
    userId: number,
    tenantId: number,
    updateDto: UpdateUserTenantRoleDto,
  ): Promise<UserTenantResponseDto> {
    const { roleId } = updateDto;

    // Check if role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user is in tenant
    const exists = await this.userTenantRepository.existsUserInTenant(userId, tenantId);
    if (!exists) {
      throw new NotFoundException('User is not assigned to this tenant');
    }

    // Update role
    const userTenant = await this.userTenantRepository.updateUserTenantRole(
      userId,
      tenantId,
      roleId,
    );

    if (!userTenant) {
      throw new NotFoundException('Failed to update user tenant role');
    }

    return {
      tenantId: userTenant.tenantId,
      tenantCode: userTenant.tenantCode,
      tenantName: userTenant.tenantName,
      roleId: userTenant.roleId,
      roleName: userTenant.roleName,
      isPrimary: userTenant.isPrimary,
      joinedAt: userTenant.joinedAt,
    };
  }
}

