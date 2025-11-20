export enum PostingStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export class PostingItem {
  id: number;
  postingId: number;
  productId: number;
  productName: string;
  productSku: string;
  areaId?: number;
  quantityBefore: number;
  quantityAfter: number;
  unit: string;
  unitCost: number;
  adjustmentAmount: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryPosting {
  id: number;
  postingNumber: string;
  countingId?: number;
  warehouseId: number;
  postingDate: Date;
  status: PostingStatus;
  postedBy: string;
  reason: string;
  notes?: string;
  items: PostingItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
