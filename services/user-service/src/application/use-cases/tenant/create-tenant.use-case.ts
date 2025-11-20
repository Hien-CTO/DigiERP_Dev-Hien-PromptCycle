import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { CreateTenantDto, TenantResponseDto } from '../../dtos/tenant.dto';
import { TenantEntity } from '@/domain/entities/tenant.entity';
import { InitializeTenantRolesAndPermissionsUseCase } from './initialize-tenant-roles-permissions.use-case';

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
    private readonly initializeTenantRolesAndPermissionsUseCase: InitializeTenantRolesAndPermissionsUseCase,
  ) {}

  async execute(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const {
      code,
      name,
      displayName,
      description,
      taxCode,
      email,
      phone,
      address,
      cityId,
      provinceId,
      countryId,
      logoUrl,
      website,
      status = 'ACTIVE',
      subscriptionTier = 'BASIC',
      subscriptionExpiresAt,
      maxUsers = 10,
      maxStorageGb = 10,
      settings,
      isActive = true,
    } = createTenantDto;

    // Check if code already exists
    const existingTenantByCode = await this.tenantRepository.existsByCode(code);
    if (existingTenantByCode) {
      throw new ConflictException('Tenant code already exists');
    }

    // Check if tax code already exists (if provided)
    if (taxCode) {
      const existingTenantByTaxCode = await this.tenantRepository.existsByTaxCode(taxCode);
      if (existingTenantByTaxCode) {
        throw new ConflictException('Tax code already exists');
      }
    }

    // Parse subscription expiration date if provided
    let subscriptionExpiresAtDate: Date | undefined;
    if (subscriptionExpiresAt) {
      subscriptionExpiresAtDate = new Date(subscriptionExpiresAt);
    }

    // Create tenant entity
    const tenantEntity = new TenantEntity(
      0, // id will be set by database
      code,
      name,
      displayName,
      description,
      taxCode,
      email,
      phone,
      address,
      cityId,
      provinceId,
      countryId,
      logoUrl,
      website,
      status,
      subscriptionTier,
      subscriptionExpiresAtDate,
      maxUsers,
      maxStorageGb,
      settings,
      isActive,
      new Date(), // createdAt
      new Date(), // updatedAt
      undefined, // createdBy
      undefined, // updatedBy
    );

    // Save tenant
    const createdTenant = await this.tenantRepository.create(tenantEntity);

    // Initialize roles and permissions for the new tenant
    try {
      await this.initializeTenantRolesAndPermissionsUseCase.execute(createdTenant.id);
    } catch (error) {
      // Log error but don't fail tenant creation if roles/permissions initialization fails
      console.error(`Failed to initialize roles and permissions for tenant ${createdTenant.id}:`, error);
    }

    return this.toResponseDto(createdTenant);
  }

  private toResponseDto(tenant: TenantEntity): TenantResponseDto {
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

