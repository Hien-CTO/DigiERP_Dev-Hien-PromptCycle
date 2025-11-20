import { Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../../../infrastructure/database/repositories/warehouse.repository';
import { Warehouse } from '../../../domain/entities/warehouse.entity';

@Injectable()
export class GetWarehousesUseCase {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ warehouses: Warehouse[]; total: number; page: number; limit: number; totalPages: number }> {
    const result = await this.warehouseRepository.findAll(page, limit, search);
    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
