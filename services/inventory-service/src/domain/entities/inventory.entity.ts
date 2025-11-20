export class Inventory {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly warehouseId: number,
    public readonly quantityOnHand: number,
    public readonly quantityReserved: number,
    public readonly quantityAvailable: number,
    public readonly reorderPoint: number,
    public readonly reorderQuantity: number,
    public readonly unitCost: number,
    public readonly status: string,
    public readonly notes: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly updatedBy: number,
  ) {}
}
