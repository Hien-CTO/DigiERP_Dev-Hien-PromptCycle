import { InventoryCounting } from '../entities/inventory-counting.entity';

export interface IInventoryCountingRepository {
  create(inventoryCounting: InventoryCounting): Promise<InventoryCounting>;
  findById(id: number): Promise<InventoryCounting | null>;
  findAll(): Promise<InventoryCounting[]>;
  findByWarehouseId(warehouseId: number): Promise<InventoryCounting[]>;
  findByStatus(status: string): Promise<InventoryCounting[]>;
  update(id: number, inventoryCounting: Partial<InventoryCounting>): Promise<InventoryCounting>;
  delete(id: number): Promise<void>;
  generateCountingNumber(): Promise<string>;
}
