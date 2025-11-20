import { InventoryRevaluation } from '../entities/inventory-revaluation.entity';

export interface IInventoryRevaluationRepository {
  create(inventoryRevaluation: InventoryRevaluation): Promise<InventoryRevaluation>;
  findById(id: number): Promise<InventoryRevaluation | null>;
  findAll(): Promise<InventoryRevaluation[]>;
  findByWarehouseId(warehouseId: number): Promise<InventoryRevaluation[]>;
  findByStatus(status: string): Promise<InventoryRevaluation[]>;
  update(id: number, inventoryRevaluation: Partial<InventoryRevaluation>): Promise<InventoryRevaluation>;
  delete(id: number): Promise<void>;
  generateRevaluationNumber(): Promise<string>;
}
