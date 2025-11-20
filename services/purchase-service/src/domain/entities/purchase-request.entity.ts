export enum PurchaseRequestStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  productId: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  estimatedUnitCost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseRequest {
  constructor(
    public readonly id: string,
    public readonly requestNumber: string,
    public readonly warehouseId: string,
    public readonly status: PurchaseRequestStatus,
    public readonly requestDate: Date,
    public readonly reason: string,
    public readonly requestedBy: string,
    public readonly requiredDate?: Date,
    public readonly notes?: string,
    public readonly approvedBy?: string,
    public readonly rejectedBy?: string,
    public readonly approvedAt?: Date,
    public readonly rejectedAt?: Date,
    public readonly rejectionReason?: string,
    public readonly items: PurchaseRequestItem[] = [],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    requestNumber: string,
    warehouseId: string,
    requestDate: Date,
    reason: string,
    requestedBy: string,
    requiredDate?: Date,
    notes?: string,
  ): PurchaseRequest {
    return new PurchaseRequest(
      '', // Will be set by repository
      requestNumber,
      warehouseId,
      PurchaseRequestStatus.DRAFT,
      requestDate,
      reason,
      requestedBy,
      requiredDate,
      notes,
      undefined, // approvedBy
      undefined, // rejectedBy
      undefined, // approvedAt
      undefined, // rejectedAt
      undefined, // rejectionReason
      [], // items
    );
  }

  submit(): PurchaseRequest {
    if (this.status !== PurchaseRequestStatus.DRAFT) {
      throw new Error('Only DRAFT requests can be submitted');
    }
    return new PurchaseRequest(
      this.id,
      this.requestNumber,
      this.warehouseId,
      PurchaseRequestStatus.PENDING_APPROVAL,
      this.requestDate,
      this.reason,
      this.requestedBy,
      this.requiredDate,
      this.notes,
      this.approvedBy,
      this.rejectedBy,
      this.approvedAt,
      this.rejectedAt,
      this.rejectionReason,
      this.items,
      this.createdAt,
      new Date(),
    );
  }

  approve(approvedBy: string): PurchaseRequest {
    if (this.status !== PurchaseRequestStatus.PENDING_APPROVAL) {
      throw new Error('Only PENDING_APPROVAL requests can be approved');
    }
    return new PurchaseRequest(
      this.id,
      this.requestNumber,
      this.warehouseId,
      PurchaseRequestStatus.APPROVED,
      this.requestDate,
      this.reason,
      this.requestedBy,
      this.requiredDate,
      this.notes,
      approvedBy,
      this.rejectedBy,
      new Date(),
      this.rejectedAt,
      this.rejectionReason,
      this.items,
      this.createdAt,
      new Date(),
    );
  }

  reject(rejectedBy: string, rejectionReason: string): PurchaseRequest {
    if (this.status !== PurchaseRequestStatus.PENDING_APPROVAL) {
      throw new Error('Only PENDING_APPROVAL requests can be rejected');
    }
    return new PurchaseRequest(
      this.id,
      this.requestNumber,
      this.warehouseId,
      PurchaseRequestStatus.REJECTED,
      this.requestDate,
      this.reason,
      this.requestedBy,
      this.requiredDate,
      this.notes,
      this.approvedBy,
      rejectedBy,
      this.approvedAt,
      new Date(),
      rejectionReason,
      this.items,
      this.createdAt,
      new Date(),
    );
  }

  cancel(): PurchaseRequest {
    if (
      this.status === PurchaseRequestStatus.APPROVED ||
      this.status === PurchaseRequestStatus.CANCELLED
    ) {
      throw new Error('Cannot cancel APPROVED or CANCELLED requests');
    }
    return new PurchaseRequest(
      this.id,
      this.requestNumber,
      this.warehouseId,
      PurchaseRequestStatus.CANCELLED,
      this.requestDate,
      this.reason,
      this.requestedBy,
      this.requiredDate,
      this.notes,
      this.approvedBy,
      this.rejectedBy,
      this.approvedAt,
      this.rejectedAt,
      this.rejectionReason,
      this.items,
      this.createdAt,
      new Date(),
    );
  }

  canConvertToPurchaseOrder(): boolean {
    return this.status === PurchaseRequestStatus.APPROVED;
  }
}

