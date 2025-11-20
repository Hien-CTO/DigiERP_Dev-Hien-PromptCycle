export interface InventoryResponse {
  id: number;
  productId: number;
  warehouseId: number;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}
