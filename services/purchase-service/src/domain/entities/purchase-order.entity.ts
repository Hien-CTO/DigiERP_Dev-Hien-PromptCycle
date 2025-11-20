export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalAmount: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  taxAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderImporterInfo {
  importerName?: string;
  importerPhone?: string;
  importerFax?: string;
  importerEmail?: string;
}

export class PurchaseOrder {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly supplierId: number,
    public readonly warehouseId: number,
    public readonly status: PurchaseOrderStatus,
    public readonly orderDate: Date,
    public readonly expectedDeliveryDate?: Date,
    public readonly predictedArrivalDate?: Date,
    public readonly totalAmount: number = 0,
    public readonly taxAmount: number = 0,
    public readonly discountAmount: number = 0,
    public readonly finalAmount: number = 0,
    public readonly notes?: string,
    public readonly paymentTerm?: string,
    public readonly paymentMethod?: string,
    public readonly portName?: string,
    public readonly importer?: PurchaseOrderImporterInfo,
    public readonly items: PurchaseOrderItem[] = [],
    public readonly createdBy?: number,
    public readonly updatedBy?: number,
    public readonly approvedBy?: string,
    public readonly approvedAt?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly purchaseRequestId?: string,
  ) {}

  static create(
    orderNumber: string,
    supplierId: number,
    warehouseId: number,
    orderDate: Date,
    expectedDeliveryDate?: Date,
    predictedArrivalDate?: Date,
    paymentTerm?: string,
    paymentMethod?: string,
    portName?: string,
    importer?: PurchaseOrderImporterInfo,
    notes?: string,
    createdBy?: number,
    purchaseRequestId?: string,
  ): PurchaseOrder {
    return new PurchaseOrder(
      '', // Will be set by repository
      orderNumber,
      supplierId,
      warehouseId,
      PurchaseOrderStatus.DRAFT,
      orderDate,
      expectedDeliveryDate,
      predictedArrivalDate,
      0,
      0,
      0,
      0,
      notes,
      paymentTerm,
      paymentMethod,
      portName,
      importer,
      [], // items
      createdBy,
      createdBy, // updatedBy
      undefined, // approvedBy
      undefined, // approvedAt
      undefined, // createdAt
      undefined, // updatedAt
      purchaseRequestId,
    );
  }

  approve(approvedBy: string): PurchaseOrder {
    return new PurchaseOrder(
      this.id,
      this.orderNumber,
      this.supplierId,
      this.warehouseId,
      PurchaseOrderStatus.APPROVED,
      this.orderDate,
      this.expectedDeliveryDate,
      this.predictedArrivalDate,
      this.totalAmount,
      this.taxAmount,
      this.discountAmount,
      this.finalAmount,
      this.notes,
      this.paymentTerm,
      this.paymentMethod,
      this.portName,
      this.importer,
      this.items,
      this.createdBy,
      this.updatedBy,
      approvedBy,
      new Date(),
      this.createdAt,
      new Date(),
      this.purchaseRequestId,
    );
  }

  updateAmounts(
    totalAmount: number,
    taxAmount: number,
    discountAmount: number,
    finalAmount: number,
  ): PurchaseOrder {
    return new PurchaseOrder(
      this.id,
      this.orderNumber,
      this.supplierId,
      this.warehouseId,
      this.status,
      this.orderDate,
      this.expectedDeliveryDate,
      this.predictedArrivalDate,
      totalAmount,
      taxAmount,
      discountAmount,
      finalAmount,
      this.notes,
      this.paymentTerm,
      this.paymentMethod,
      this.portName,
      this.importer,
      this.items,
      this.createdBy,
      this.updatedBy,
      this.approvedBy,
      this.approvedAt,
      this.createdAt,
      new Date(),
      this.purchaseRequestId,
    );
  }

  markAsReceived(): PurchaseOrder {
    return new PurchaseOrder(
      this.id,
      this.orderNumber,
      this.supplierId,
      this.warehouseId,
      PurchaseOrderStatus.RECEIVED,
      this.orderDate,
      this.expectedDeliveryDate,
      this.predictedArrivalDate,
      this.totalAmount,
      this.taxAmount,
      this.discountAmount,
      this.finalAmount,
      this.notes,
      this.paymentTerm,
      this.paymentMethod,
      this.portName,
      this.importer,
      this.items,
      this.createdBy,
      this.updatedBy,
      this.approvedBy,
      this.approvedAt,
      this.createdAt,
      new Date(),
      this.purchaseRequestId,
    );
  }

  cancel(): PurchaseOrder {
    return new PurchaseOrder(
      this.id,
      this.orderNumber,
      this.supplierId,
      this.warehouseId,
      PurchaseOrderStatus.CANCELLED,
      this.orderDate,
      this.expectedDeliveryDate,
      this.predictedArrivalDate,
      this.totalAmount,
      this.taxAmount,
      this.discountAmount,
      this.finalAmount,
      this.notes,
      this.paymentTerm,
      this.paymentMethod,
      this.portName,
      this.importer,
      this.items,
      this.createdBy,
      this.updatedBy,
      this.approvedBy,
      this.approvedAt,
      this.createdAt,
      new Date(),
      this.purchaseRequestId,
    );
  }
}
