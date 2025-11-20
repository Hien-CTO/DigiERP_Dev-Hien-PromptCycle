import { Injectable } from '@nestjs/common';
import { InventoryCountingRepository } from '../../../infrastructure/database/repositories/inventory-counting.repository';
import { InventoryCounting } from '../../../domain/entities/inventory-counting.entity';

@Injectable()
export class GetInventoryCountingUseCase {
  constructor(
    private readonly inventoryCountingRepository: InventoryCountingRepository,
  ) {}

  async execute(id: number): Promise<InventoryCounting | null> {
    return await this.inventoryCountingRepository.findById(id);
  }
}
