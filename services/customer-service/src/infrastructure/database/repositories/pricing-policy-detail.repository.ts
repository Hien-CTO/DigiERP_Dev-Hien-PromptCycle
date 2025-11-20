import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingPolicyDetail as PricingPolicyDetailEntity } from '../entities/pricing-policy-detail.entity';
import { PricingPolicyDetailRepository as IPricingPolicyDetailRepository } from '../../../domain/repositories/pricing-policy.repository.interface';
import { PricingPolicyDetail } from '../../../domain/entities/pricing-policy-detail.entity';

@Injectable()
export class TypeOrmPricingPolicyDetailRepository
  implements IPricingPolicyDetailRepository
{
  constructor(
    @InjectRepository(PricingPolicyDetailEntity)
    private readonly repository: Repository<PricingPolicyDetailEntity>,
  ) {}

  async findByPolicyId(policyId: number): Promise<PricingPolicyDetail[]> {
    const entities = await this.repository.find({
      where: { pricing_policy_id: policyId },
      order: { created_at: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findByPolicyIdAndProductId(
    policyId: number,
    productId: number,
  ): Promise<PricingPolicyDetail | null> {
    const entity = await this.repository.findOne({
      where: {
        pricing_policy_id: policyId,
        product_id: productId,
      },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(detail: PricingPolicyDetail): Promise<PricingPolicyDetail> {
    const entity = this.toEntity(detail);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async saveMany(details: PricingPolicyDetail[]): Promise<PricingPolicyDetail[]> {
    const entities = details.map(this.toEntity);
    const saved = await this.repository.save(entities);
    return saved.map(this.toDomain);
  }

  async update(
    id: number,
    detail: Partial<PricingPolicyDetail>,
  ): Promise<PricingPolicyDetail> {
    await this.repository.update(id, this.toEntity(detail as PricingPolicyDetail));
    const updated = await this.repository.findOne({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByPolicyId(policyId: number): Promise<void> {
    await this.repository.delete({ pricing_policy_id: policyId });
  }

  private toDomain(entity: PricingPolicyDetailEntity): PricingPolicyDetail {
    return new PricingPolicyDetail(
      entity.id,
      entity.pricing_policy_id,
      entity.product_id,
      entity.base_price,
      entity.discount_percentage,
      entity.discounted_price,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: PricingPolicyDetail): PricingPolicyDetailEntity {
    const entity = new PricingPolicyDetailEntity();
    entity.id = domain.id;
    entity.pricing_policy_id = domain.pricingPolicyId;
    entity.product_id = domain.productId;
    entity.base_price = domain.basePrice;
    entity.discount_percentage = domain.discountPercentage;
    entity.discounted_price = domain.discountedPrice;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}


