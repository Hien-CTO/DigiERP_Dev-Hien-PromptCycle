export class PricingPolicyDetail {
  constructor(
    public readonly id: number,
    public readonly pricingPolicyId: number,
    public readonly productId: number,
    public readonly basePrice: number,
    public readonly discountPercentage: number,
    public readonly discountedPrice: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number | null,
    public readonly updatedBy: number | null,
  ) {}

  calculateDiscountedPrice(): number {
    const discountAmount = (this.basePrice * this.discountPercentage) / 100;
    return this.basePrice - discountAmount;
  }
}


