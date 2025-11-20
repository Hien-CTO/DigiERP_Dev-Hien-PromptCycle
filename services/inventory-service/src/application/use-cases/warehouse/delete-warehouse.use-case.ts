import { Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../../../infrastructure/database/repositories/warehouse.repository';

@Injectable()
export class DeleteWarehouseUseCase {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async execute(id: number): Promise<void> {
    // Check if warehouse exists
    const existingWarehouse = await this.warehouseRepository.findById(id);
    if (!existingWarehouse) {
      throw new Error('Warehouse not found');
    }

    // TODO: Check if warehouse has any areas or inventory before deletion
    // This would require additional repository methods to check dependencies

    await this.warehouseRepository.delete(id);
  }
}
