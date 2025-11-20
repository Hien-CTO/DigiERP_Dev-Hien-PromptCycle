import { InventoryTransferRequest } from '../entities/inventory-transfer-request.entity';

export interface IInventoryTransferRequestRepository {
  create(transferRequest: InventoryTransferRequest): Promise<InventoryTransferRequest>;
  findById(id: number): Promise<InventoryTransferRequest | null>;
  findAll(): Promise<InventoryTransferRequest[]>;
  findByFromWarehouseId(warehouseId: number): Promise<InventoryTransferRequest[]>;
  findByToWarehouseId(warehouseId: number): Promise<InventoryTransferRequest[]>;
  findByStatus(status: string): Promise<InventoryTransferRequest[]>;
  update(id: number, transferRequest: Partial<InventoryTransferRequest>): Promise<InventoryTransferRequest>;
  delete(id: number): Promise<void>;
  generateRequestNumber(): Promise<string>;
}
