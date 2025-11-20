import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../../infrastructure/database/repositories/inventory.repository';
import { Inventory } from '../../../domain/entities/inventory.entity';

@Injectable()
export class GetInventoryUseCase {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async execute(productId: number, warehouseId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findByProductAndWarehouse(productId, warehouseId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }
    return inventory;
  }
}
