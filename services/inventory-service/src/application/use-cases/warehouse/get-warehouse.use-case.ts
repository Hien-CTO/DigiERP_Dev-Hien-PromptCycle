import { Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../../../infrastructure/database/repositories/warehouse.repository';
import { Warehouse } from '../../../domain/entities/warehouse.entity';

@Injectable()
export class GetWarehouseUseCase {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }
    return warehouse;
  }
}
