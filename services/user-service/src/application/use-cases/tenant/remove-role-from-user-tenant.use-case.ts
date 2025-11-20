import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';

@Injectable()
export class RemoveRoleFromUserTenantUseCase {
  constructor(
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: number, tenantId: number, roleId: number): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if role exists
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user-tenant-role relationship exists
    const userTenantRecords = await this.userTenantRepository.findAllUserTenants(userId);
    const exists = userTenantRecords.some(
      ut => ut.tenantId === tenantId && ut.roleId === roleId
    );

    if (!exists) {
      throw new NotFoundException('User does not have this role in this tenant');
    }

    // Remove the specific role from user-tenant
    const removed = await this.userTenantRepository.removeRoleFromUserTenant(userId, tenantId, roleId);
    if (!removed) {
      throw new NotFoundException('Failed to remove role from user tenant');
    }

    return {
      message: 'Role removed from user tenant successfully',
    };
  }
}

