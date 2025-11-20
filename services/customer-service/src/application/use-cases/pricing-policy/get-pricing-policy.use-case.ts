import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmPricingPolicyRepository } from '../../../infrastructure/database/repositories/pricing-policy.repository';
import { TypeOrmPricingPolicyDetailRepository } from '../../../infrastructure/database/repositories/pricing-policy-detail.repository';
import { PricingPolicy } from '../../../domain/entities/pricing-policy.entity';

@Injectable()
export class GetPricingPolicyUseCase {
  constructor(
    private readonly policyRepository: TypeOrmPricingPolicyRepository,
    private readonly detailRepository: TypeOrmPricingPolicyDetailRepository,
  ) {}

  async execute(id: number): Promise<PricingPolicy> {
    const policy = await this.policyRepository.findById(id);
    if (!policy) {
      throw new NotFoundException(`Pricing policy with ID ${id} not found`);
    }
    return policy;
  }
}


