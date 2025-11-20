import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmPricingPolicyRepository } from '../../../infrastructure/database/repositories/pricing-policy.repository';

@Injectable()
export class DeletePricingPolicyUseCase {
  constructor(
    private readonly policyRepository: TypeOrmPricingPolicyRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const policy = await this.policyRepository.findById(id);
    if (!policy) {
      throw new NotFoundException(`Pricing policy with ID ${id} not found`);
    }
    await this.policyRepository.delete(id);
  }
}


