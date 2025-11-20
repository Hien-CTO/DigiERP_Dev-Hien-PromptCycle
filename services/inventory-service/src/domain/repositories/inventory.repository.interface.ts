import { Inventory } from '../entities/inventory.entity';

export interface InventoryRepository {
  findById(id: number): Promise<Inventory | null>;
  findByProductAndWarehouse(productId: number, warehouseId: number): Promise<Inventory | null>;
  findByProductId(productId: number): Promise<Inventory[]>;
  findByWarehouseId(warehouseId: number): Promise<Inventory[]>;
  save(inventory: Inventory): Promise<Inventory>;
  update(id: number, inventory: Partial<Inventory>): Promise<Inventory>;
  delete(id: number): Promise<void>;
}
