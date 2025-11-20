import { Area } from '../entities/area.entity';

export interface AreaRepository {
  findById(id: number): Promise<Area | null>;
  findAll(page?: number, limit?: number, search?: string, warehouseId?: number): Promise<{ areas: Area[]; total: number }>;
  findByCode(code: string): Promise<Area | null>;
  findByWarehouse(warehouseId: number): Promise<Area[]>;
  create(area: Partial<Area>): Promise<Area>;
  update(id: number, area: Partial<Area>): Promise<Area>;
  delete(id: number): Promise<void>;
  findByType(type: string): Promise<Area[]>;
  findByStatus(status: string): Promise<Area[]>;
}
