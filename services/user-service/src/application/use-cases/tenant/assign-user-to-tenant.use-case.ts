import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { AssignUserToTenantDto, UserTenantResponseDto } from '../../dtos/user-tenant.dto';

@Injectable()
export class AssignUserToTenantUseCase {
  constructor(
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(
    assignDto: AssignUserToTenantDto,
    invitedBy?: number,
  ): Promise<UserTenantResponseDto> {
    const { userId, tenantId, roleId, isPrimary = false } = assignDto;

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

    // Check if user already in tenant
    const exists = await this.userTenantRepository.existsUserInTenant(userId, tenantId);
    if (exists) {
      throw new ConflictException('User is already assigned to this tenant');
    }

    // Assign user to tenant
    const userTenant = await this.userTenantRepository.assignUserToTenant(
      userId,
      tenantId,
      roleId,
      isPrimary,
      invitedBy,
    );

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

