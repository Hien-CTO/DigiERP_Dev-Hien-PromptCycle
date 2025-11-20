import { PricingPolicy } from '../entities/pricing-policy.entity';
import { PricingPolicyDetail } from '../entities/pricing-policy-detail.entity';

export interface PricingPolicyRepository {
  findById(id: number): Promise<PricingPolicy | null>;
  findByCustomerId(customerId: string): Promise<PricingPolicy[]>;
  findByCode(code: string): Promise<PricingPolicy | null>;
  findAll(
    page: number,
    limit: number,
    customerId?: string,
  ): Promise<{ policies: PricingPolicy[]; total: number }>;
  save(policy: PricingPolicy): Promise<PricingPolicy>;
  update(id: number, policy: Partial<PricingPolicy>): Promise<PricingPolicy>;
  delete(id: number): Promise<void>;
}

export interface PricingPolicyDetailRepository {
  findByPolicyId(policyId: number): Promise<PricingPolicyDetail[]>;
  findByPolicyIdAndProductId(
    policyId: number,
    productId: number,
  ): Promise<PricingPolicyDetail | null>;
  save(detail: PricingPolicyDetail): Promise<PricingPolicyDetail>;
  saveMany(details: PricingPolicyDetail[]): Promise<PricingPolicyDetail[]>;
  update(id: number, detail: Partial<PricingPolicyDetail>): Promise<PricingPolicyDetail>;
  delete(id: number): Promise<void>;
  deleteByPolicyId(policyId: number): Promise<void>;
}


