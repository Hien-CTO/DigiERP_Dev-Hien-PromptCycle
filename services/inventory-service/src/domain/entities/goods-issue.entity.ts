export enum GoodsIssueStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export class GoodsIssueItem {
  id: number;
  goodsIssueId: number;
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

export class GoodsIssue {
  id: number;
  issueNumber: string;
  salesOrderId?: number;
  warehouseId: number;
  issueDate: Date;
  status: GoodsIssueStatus;
  issuedBy?: string;
  verifiedBy?: string;
  notes?: string;
  items: GoodsIssueItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
