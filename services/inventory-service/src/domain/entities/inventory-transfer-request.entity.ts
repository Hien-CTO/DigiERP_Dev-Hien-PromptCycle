export enum TransferRequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class TransferRequestItem {
  id: number;
  transferRequestId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryTransferRequest {
  id: number;
  requestNumber: string;
  fromWarehouseId: number;
  toWarehouseId: number;
  requestDate: Date;
  status: TransferRequestStatus;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  notes?: string;
  items: TransferRequestItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
