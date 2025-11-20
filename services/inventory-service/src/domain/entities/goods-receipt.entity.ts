export enum GoodsReceiptStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export class GoodsReceiptItem {
  id: number;
  goodsReceiptId: number;
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

export class GoodsReceipt {
  id: number;
  receiptNumber: string;
  purchaseOrderId?: number;
  warehouseId: number;
  receiptDate: Date;
  status: GoodsReceiptStatus;
  receivedBy?: string;
  verifiedBy?: string;
  notes?: string;
  items: GoodsReceiptItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
