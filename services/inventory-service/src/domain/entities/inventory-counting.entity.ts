export enum CountingStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class CountingItem {
  id: number;
  countingId: number;
  productId: number;
  productName: string;
  productSku: string;
  areaId?: number;
  expectedQuantity: number;
  countedQuantity: number;
  unit: string;
  unitCost: number;
  variance: number;
  varianceAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryCounting {
  id: number;
  countingNumber: string;
  warehouseId: number;
  countingDate: Date;
  status: CountingStatus;
  countedBy: string;
  reviewedBy?: string;
  reason: string;
  notes?: string;
  items: CountingItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
