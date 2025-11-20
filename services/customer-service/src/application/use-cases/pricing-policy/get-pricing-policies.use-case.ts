import { Injectable } from '@nestjs/common';
import { TypeOrmPricingPolicyRepository } from '../../../infrastructure/database/repositories/pricing-policy.repository';
import { PricingPolicy } from '../../../domain/entities/pricing-policy.entity';

@Injectable()
export class GetPricingPoliciesUseCase {
  constructor(
    private readonly policyRepository: TypeOrmPricingPolicyRepository,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    customerId?: string,
  ): Promise<{ policies: PricingPolicy[]; total: number }> {
    return await this.policyRepository.findAll(page, limit, customerId);
  }
}


