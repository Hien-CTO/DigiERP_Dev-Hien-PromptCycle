import { Injectable, Inject } from '@nestjs/common';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { TenantListResponseDto } from '../../dtos/tenant.dto';

@Injectable()
export class GetTenantsUseCase {
  constructor(@Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository) {}

  async execute(): Promise<TenantListResponseDto> {
    const result = await this.tenantRepository.findAll();

    return {
      tenants: result.tenants.map(tenant => ({
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
      })),
      total: result.total,
    };
  }
}

