import { TenantEntity } from '../entities/tenant.entity';

export interface ITenantRepository {
  findById(id: number): Promise<TenantEntity | null>;
  findByCode(code: string): Promise<TenantEntity | null>;
  findAll(page?: number, limit?: number): Promise<{ tenants: TenantEntity[]; total: number }>;
  create(tenant: Omit<TenantEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantEntity>;
  update(id: number, tenant: Partial<TenantEntity>): Promise<TenantEntity | null>;
  delete(id: number): Promise<boolean>;
  existsByCode(code: string): Promise<boolean>;
  existsByTaxCode(taxCode: string): Promise<boolean>;
}

