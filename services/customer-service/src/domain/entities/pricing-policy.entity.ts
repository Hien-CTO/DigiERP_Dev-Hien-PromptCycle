export enum PricingPolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export class PricingPolicy {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly customerId: string,
    public readonly validFrom: Date,
    public readonly validTo: Date | null,
    public readonly status: PricingPolicyStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number | null,
    public readonly updatedBy: number | null,
  ) {}

  isActive(): boolean {
    return this.status === PricingPolicyStatus.ACTIVE;
  }

  isValid(): boolean {
    if (this.status !== PricingPolicyStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    if (this.validFrom > now) {
      return false;
    }

    if (this.validTo && this.validTo < now) {
      return false;
    }

    return true;
  }
}


