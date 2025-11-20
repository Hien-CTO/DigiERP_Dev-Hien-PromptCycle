export enum TransferStatus {
  DRAFT = 'DRAFT',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class TransferItem {
  id: number;
  transferId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryTransfer {
  id: number;
  transferNumber: string;
  transferRequestId?: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  transferDate: Date;
  status: TransferStatus;
  transferredBy: string;
  receivedBy?: string;
  reason: string;
  notes?: string;
  items: TransferItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
