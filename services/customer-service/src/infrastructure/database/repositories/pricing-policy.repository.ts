import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PricingPolicy as PricingPolicyEntity,
  PricingPolicyStatus,
} from '../entities/pricing-policy.entity';
import { PricingPolicyRepository as IPricingPolicyRepository } from '../../../domain/repositories/pricing-policy.repository.interface';
import { PricingPolicy } from '../../../domain/entities/pricing-policy.entity';

@Injectable()
export class TypeOrmPricingPolicyRepository implements IPricingPolicyRepository {
  constructor(
    @InjectRepository(PricingPolicyEntity)
    private readonly repository: Repository<PricingPolicyEntity>,
  ) {}

  async findById(id: number): Promise<PricingPolicy | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['details'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<PricingPolicy[]> {
    const entities = await this.repository.find({
      where: { customer_id: customerId },
      relations: ['details'],
      order: { created_at: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findByCode(code: string): Promise<PricingPolicy | null> {
    const entity = await this.repository.findOne({
      where: { code },
      relations: ['details'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    customerId?: string,
  ): Promise<{ policies: PricingPolicy[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('policy');

    if (customerId) {
      queryBuilder.where('policy.customer_id = :customerId', { customerId });
    }

    const [entities, total] = await queryBuilder
      .leftJoinAndSelect('policy.details', 'details')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('policy.created_at', 'DESC')
      .getManyAndCount();

    return {
      policies: entities.map(this.toDomain),
      total,
    };
  }

  async save(policy: PricingPolicy): Promise<PricingPolicy> {
    const entity = this.toEntity(policy);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: number, policy: Partial<PricingPolicy>): Promise<PricingPolicy> {
    await this.repository.update(id, this.toEntity(policy as PricingPolicy));
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['details'],
    });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: PricingPolicyEntity): PricingPolicy {
    return new PricingPolicy(
      entity.id,
      entity.code,
      entity.customer_id,
      entity.valid_from,
      entity.valid_to,
      entity.status,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: PricingPolicy): PricingPolicyEntity {
    const entity = new PricingPolicyEntity();
    entity.id = domain.id;
    entity.code = domain.code;
    entity.customer_id = domain.customerId;
    entity.valid_from = domain.validFrom;
    entity.valid_to = domain.validTo;
    entity.status = domain.status;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}


