import { InventoryPosting } from '../entities/inventory-posting.entity';

export interface IInventoryPostingRepository {
  create(inventoryPosting: InventoryPosting): Promise<InventoryPosting>;
  findById(id: number): Promise<InventoryPosting | null>;
  findAll(): Promise<InventoryPosting[]>;
  findByWarehouseId(warehouseId: number): Promise<InventoryPosting[]>;
  findByStatus(status: string): Promise<InventoryPosting[]>;
  update(id: number, inventoryPosting: Partial<InventoryPosting>): Promise<InventoryPosting>;
  delete(id: number): Promise<void>;
  generatePostingNumber(): Promise<string>;
}
