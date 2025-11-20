import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { UpdateTenantDto, TenantResponseDto } from '../../dtos/tenant.dto';

@Injectable()
export class UpdateTenantUseCase {
  constructor(@Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository) {}

  async execute(tenantId: number, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    // Check if tenant exists
    const existingTenant = await this.tenantRepository.findById(tenantId);
    if (!existingTenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if new code conflicts with existing tenant
    if (updateTenantDto.code && updateTenantDto.code !== existingTenant.code) {
      const tenantWithCode = await this.tenantRepository.findByCode(updateTenantDto.code);
      if (tenantWithCode && tenantWithCode.id !== tenantId) {
        throw new ConflictException('Tenant code already exists');
      }
    }

    // Check if new tax code conflicts (if provided and different)
    if (updateTenantDto.taxCode && updateTenantDto.taxCode !== existingTenant.taxCode) {
      const existingTenantByTaxCode = await this.tenantRepository.existsByTaxCode(updateTenantDto.taxCode);
      if (existingTenantByTaxCode) {
        throw new ConflictException('Tax code already exists');
      }
    }

    // Parse subscription expiration date if provided
    let subscriptionExpiresAt: Date | undefined;
    if (updateTenantDto.subscriptionExpiresAt) {
      subscriptionExpiresAt = new Date(updateTenantDto.subscriptionExpiresAt);
    } else if (updateTenantDto.subscriptionExpiresAt === null) {
      subscriptionExpiresAt = undefined;
    }

    // Prepare update data
    const updateData: any = {};
    if (updateTenantDto.code !== undefined) updateData.code = updateTenantDto.code;
    if (updateTenantDto.name !== undefined) updateData.name = updateTenantDto.name;
    if (updateTenantDto.displayName !== undefined) updateData.displayName = updateTenantDto.displayName;
    if (updateTenantDto.description !== undefined) updateData.description = updateTenantDto.description;
    if (updateTenantDto.taxCode !== undefined) updateData.taxCode = updateTenantDto.taxCode;
    if (updateTenantDto.email !== undefined) updateData.email = updateTenantDto.email;
    if (updateTenantDto.phone !== undefined) updateData.phone = updateTenantDto.phone;
    if (updateTenantDto.address !== undefined) updateData.address = updateTenantDto.address;
    if (updateTenantDto.cityId !== undefined) updateData.cityId = updateTenantDto.cityId;
    if (updateTenantDto.provinceId !== undefined) updateData.provinceId = updateTenantDto.provinceId;
    if (updateTenantDto.countryId !== undefined) updateData.countryId = updateTenantDto.countryId;
    if (updateTenantDto.logoUrl !== undefined) updateData.logoUrl = updateTenantDto.logoUrl;
    if (updateTenantDto.website !== undefined) updateData.website = updateTenantDto.website;
    if (updateTenantDto.status !== undefined) updateData.status = updateTenantDto.status;
    if (updateTenantDto.subscriptionTier !== undefined) updateData.subscriptionTier = updateTenantDto.subscriptionTier;
    if (subscriptionExpiresAt !== undefined) updateData.subscriptionExpiresAt = subscriptionExpiresAt;
    if (updateTenantDto.maxUsers !== undefined) updateData.maxUsers = updateTenantDto.maxUsers;
    if (updateTenantDto.maxStorageGb !== undefined) updateData.maxStorageGb = updateTenantDto.maxStorageGb;
    if (updateTenantDto.settings !== undefined) updateData.settings = updateTenantDto.settings;
    if (updateTenantDto.isActive !== undefined) updateData.isActive = updateTenantDto.isActive;

    // Update tenant
    const updatedTenant = await this.tenantRepository.update(tenantId, updateData);
    if (!updatedTenant) {
      throw new NotFoundException('Tenant not found after update');
    }

    return {
      id: updatedTenant.id,
      code: updatedTenant.code,
      name: updatedTenant.name,
      displayName: updatedTenant.displayName,
      description: updatedTenant.description,
      taxCode: updatedTenant.taxCode,
      email: updatedTenant.email,
      phone: updatedTenant.phone,
      address: updatedTenant.address,
      cityId: updatedTenant.cityId,
      provinceId: updatedTenant.provinceId,
      countryId: updatedTenant.countryId,
      logoUrl: updatedTenant.logoUrl,
      website: updatedTenant.website,
      status: updatedTenant.status,
      subscriptionTier: updatedTenant.subscriptionTier,
      subscriptionExpiresAt: updatedTenant.subscriptionExpiresAt,
      maxUsers: updatedTenant.maxUsers,
      maxStorageGb: updatedTenant.maxStorageGb,
      settings: updatedTenant.settings,
      isActive: updatedTenant.isActive,
      createdAt: updatedTenant.createdAt,
      updatedAt: updatedTenant.updatedAt,
      createdBy: updatedTenant.createdBy,
      updatedBy: updatedTenant.updatedBy,
    };
  }
}

