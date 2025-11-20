import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { TenantResponseDto } from '../../dtos/tenant.dto';

@Injectable()
export class GetTenantUseCase {
  constructor(@Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository) {}

  async execute(tenantId: number): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      id: tenant.id,
      code: tenant.code,
      name: tenant.name,
      displayName: tenant.displayName,
      description: tenant.description,
      taxCode: tenant.taxCode,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      cityId: tenant.cityId,
      provinceId: tenant.provinceId,
      countryId: tenant.countryId,
      logoUrl: tenant.logoUrl,
      website: tenant.website,
      status: tenant.status,
      subscriptionTier: tenant.subscriptionTier,
      subscriptionExpiresAt: tenant.subscriptionExpiresAt,
      maxUsers: tenant.maxUsers,
      maxStorageGb: tenant.maxStorageGb,
      settings: tenant.settings,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      createdBy: tenant.createdBy,
      updatedBy: tenant.updatedBy,
    };
  }
}

