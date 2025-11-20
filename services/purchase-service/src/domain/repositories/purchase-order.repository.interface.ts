import { PurchaseOrder, PurchaseOrderStatus } from '../entities/purchase-order.entity';

export interface PurchaseOrderRepository {
  findAll(page?: number, limit?: number, search?: string): Promise<PurchaseOrder[]>;
  findById(id: string): Promise<PurchaseOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<PurchaseOrder | null>;
  findBySupplierId(supplierId: number): Promise<PurchaseOrder[]>;
  findByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrder[]>;
  create(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
  save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
  update(id: string, updateData: Partial<PurchaseOrder>): Promise<PurchaseOrder>;
  delete(id: string): Promise<void>;
  findPendingOrders(): Promise<PurchaseOrder[]>;
  findApprovedOrders(): Promise<PurchaseOrder[]>;
  generateOrderNumber(): Promise<string>;
}
