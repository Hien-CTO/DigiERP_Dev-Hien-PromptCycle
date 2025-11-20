import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant as TenantEntity } from '../entities/tenant.entity';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { TenantEntity as DomainTenantEntity } from '@/domain/entities/tenant.entity';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async findById(id: number): Promise<DomainTenantEntity | null> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    return tenant ? this.toDomainEntity(tenant) : null;
  }

  async findByCode(code: string): Promise<DomainTenantEntity | null> {
    const tenant = await this.tenantRepository.findOne({ where: { code } });
    return tenant ? this.toDomainEntity(tenant) : null;
  }

  async findAll(page?: number, limit?: number): Promise<{ tenants: DomainTenantEntity[]; total: number }> {
    const options: any = {
      order: { created_at: 'DESC' },
    };

    if (page && limit) {
      options.skip = (page - 1) * limit;
      options.take = limit;
    }

    const [tenants, total] = await this.tenantRepository.findAndCount(options);

    return {
      tenants: tenants.map(tenant => this.toDomainEntity(tenant)),
      total,
    };
  }

  async create(tenant: Omit<DomainTenantEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DomainTenantEntity> {
    const tenantEntity = this.tenantRepository.create({
      code: tenant.code,
      name: tenant.name,
      display_name: tenant.displayName,
      description: tenant.description,
      tax_code: tenant.taxCode,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      city_id: tenant.cityId,
      province_id: tenant.provinceId,
      country_id: tenant.countryId,
      logo_url: tenant.logoUrl,
      website: tenant.website,
      status: tenant.status,
      subscription_tier: tenant.subscriptionTier,
      subscription_expires_at: tenant.subscriptionExpiresAt,
      max_users: tenant.maxUsers,
      max_storage_gb: tenant.maxStorageGb,
      settings: tenant.settings,
      is_active: tenant.isActive,
      created_by: tenant.createdBy,
      updated_by: tenant.updatedBy,
    });

    const savedTenant = await this.tenantRepository.save(tenantEntity);
    return this.toDomainEntity(savedTenant);
  }

  async update(id: number, tenant: Partial<DomainTenantEntity>): Promise<DomainTenantEntity | null> {
    const updateData: any = {};
    
    if (tenant.code) updateData.code = tenant.code;
    if (tenant.name) updateData.name = tenant.name;
    if (tenant.displayName) updateData.display_name = tenant.displayName;
    if (tenant.description !== undefined) updateData.description = tenant.description;
    if (tenant.taxCode !== undefined) updateData.tax_code = tenant.taxCode;
    if (tenant.email !== undefined) updateData.email = tenant.email;
    if (tenant.phone !== undefined) updateData.phone = tenant.phone;
    if (tenant.address !== undefined) updateData.address = tenant.address;
    if (tenant.cityId !== undefined) updateData.city_id = tenant.cityId;
    if (tenant.provinceId !== undefined) updateData.province_id = tenant.provinceId;
    if (tenant.countryId !== undefined) updateData.country_id = tenant.countryId;
    if (tenant.logoUrl !== undefined) updateData.logo_url = tenant.logoUrl;
    if (tenant.website !== undefined) updateData.website = tenant.website;
    if (tenant.status) updateData.status = tenant.status;
    if (tenant.subscriptionTier) updateData.subscription_tier = tenant.subscriptionTier;
    if (tenant.subscriptionExpiresAt !== undefined) updateData.subscription_expires_at = tenant.subscriptionExpiresAt;
    if (tenant.maxUsers !== undefined) updateData.max_users = tenant.maxUsers;
    if (tenant.maxStorageGb !== undefined) updateData.max_storage_gb = tenant.maxStorageGb;
    if (tenant.settings !== undefined) updateData.settings = tenant.settings;
    if (tenant.isActive !== undefined) updateData.is_active = tenant.isActive;
    if (tenant.updatedBy !== undefined) updateData.updated_by = tenant.updatedBy;

    await this.tenantRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.tenantRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.tenantRepository.count({ where: { code } });
    return count > 0;
  }

  async existsByTaxCode(taxCode: string): Promise<boolean> {
    const count = await this.tenantRepository.count({ where: { tax_code: taxCode } });
    return count > 0;
  }

  private toDomainEntity(tenant: TenantEntity): DomainTenantEntity {
    return new DomainTenantEntity(
      tenant.id,
      tenant.code,
      tenant.name,
      tenant.display_name,
      tenant.description,
      tenant.tax_code,
      tenant.email,
      tenant.phone,
      tenant.address,
      tenant.city_id,
      tenant.province_id,
      tenant.country_id,
      tenant.logo_url,
      tenant.website,
      tenant.status,
      tenant.subscription_tier,
      tenant.subscription_expires_at,
      tenant.max_users,
      tenant.max_storage_gb,
      tenant.settings,
      tenant.is_active,
      tenant.created_at,
      tenant.updated_at,
      tenant.created_by,
      tenant.updated_by,
    );
  }
}

