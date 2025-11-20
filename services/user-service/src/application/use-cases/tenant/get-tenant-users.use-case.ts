import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { TenantUsersListResponseDto } from '../../dtos/user-tenant.dto';

@Injectable()
export class GetTenantUsersUseCase {
  constructor(
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: number): Promise<TenantUsersListResponseDto> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get all users in tenant
    const users = await this.userTenantRepository.findAllTenantUsers(tenantId);

    return {
      users: users.map(user => ({
        userId: user.userId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        roleName: user.roleName,
        isPrimary: user.isPrimary,
        joinedAt: user.joinedAt,
        isActive: user.isActive,
      })),
    };
  }
}

