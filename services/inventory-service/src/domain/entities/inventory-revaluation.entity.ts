export enum RevaluationStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class RevaluationItem {
  id: number;
  revaluationId: number;
  productId: number;
  productName: string;
  productSku: string;
  areaId?: number;
  quantity: number;
  unit: string;
  oldUnitCost: number;
  newUnitCost: number;
  revaluationAmount: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryRevaluation {
  id: number;
  revaluationNumber: string;
  warehouseId: number;
  revaluationDate: Date;
  status: RevaluationStatus;
  revaluedBy: string;
  reason: string;
  notes?: string;
  items: RevaluationItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
