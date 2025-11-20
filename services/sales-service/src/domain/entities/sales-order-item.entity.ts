export class SalesOrderItem {
  constructor(
    public readonly id: number,
    public readonly orderId: number,
    public readonly productId: number,
    public readonly productSku: string,
    public readonly productName: string,
    public readonly productDescription: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly discountAmount: number,
    public readonly discountPercentage: number,
    public readonly lineTotal: number,
    public readonly unit: string,
    public readonly weight: number,
    public readonly notes: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly updatedBy: number,
  ) {}
}
