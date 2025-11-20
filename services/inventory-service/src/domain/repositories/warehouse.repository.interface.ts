import { Warehouse } from '../entities/warehouse.entity';

export interface WarehouseRepository {
  findById(id: number): Promise<Warehouse | null>;
  findAll(page?: number, limit?: number, search?: string): Promise<{ warehouses: Warehouse[]; total: number }>;
  findByCode(code: string): Promise<Warehouse | null>;
  create(warehouse: Partial<Warehouse>): Promise<Warehouse>;
  update(id: number, warehouse: Partial<Warehouse>): Promise<Warehouse>;
  delete(id: number): Promise<void>;
  findByStatus(status: string): Promise<Warehouse[]>;
}
