import { PurchaseRequest } from '../entities/purchase-request.entity';

export interface PurchaseRequestRepository {
  create(purchaseRequest: PurchaseRequest): Promise<PurchaseRequest>;
  update(purchaseRequest: PurchaseRequest): Promise<PurchaseRequest>;
  findById(id: string): Promise<PurchaseRequest | null>;
  findByRequestNumber(requestNumber: string): Promise<PurchaseRequest | null>;
  findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    warehouseId?: string,
  ): Promise<{ data: PurchaseRequest[]; total: number }>;
  delete(id: string): Promise<void>;
}

