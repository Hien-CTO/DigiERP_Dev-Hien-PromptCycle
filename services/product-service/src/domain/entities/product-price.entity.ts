export class ProductPrice {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly price: number,
    public readonly documentPrice: number,
    public readonly isActive: boolean,
    public readonly notes: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly updatedBy: number,
  ) {}
}
