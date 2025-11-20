import { InventoryTransfer } from '../entities/inventory-transfer.entity';

export interface IInventoryTransferRepository {
  create(inventoryTransfer: InventoryTransfer): Promise<InventoryTransfer>;
  findById(id: number): Promise<InventoryTransfer | null>;
  findAll(): Promise<InventoryTransfer[]>;
  findByFromWarehouseId(warehouseId: number): Promise<InventoryTransfer[]>;
  findByToWarehouseId(warehouseId: number): Promise<InventoryTransfer[]>;
  findByStatus(status: string): Promise<InventoryTransfer[]>;
  findByTransferRequestId(transferRequestId: number): Promise<InventoryTransfer[]>;
  update(id: number, inventoryTransfer: Partial<InventoryTransfer>): Promise<InventoryTransfer>;
  delete(id: number): Promise<void>;
  generateTransferNumber(): Promise<string>;
}
