import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';

@Injectable()
export class SetPrimaryTenantUseCase {
  constructor(
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(userId: number, tenantId: number): Promise<{ message: string }> {
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

    // Check if user is in tenant
    const exists = await this.userTenantRepository.existsUserInTenant(userId, tenantId);
    if (!exists) {
      throw new NotFoundException('User is not assigned to this tenant');
    }

    // Set primary tenant
    await this.userTenantRepository.setPrimaryTenant(userId, tenantId);

    return {
      message: 'Primary tenant set successfully',
    };
  }
}

