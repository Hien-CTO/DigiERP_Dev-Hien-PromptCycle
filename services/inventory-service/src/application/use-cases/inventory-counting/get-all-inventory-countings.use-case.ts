import { Injectable } from '@nestjs/common';
import { InventoryCountingRepository } from '../../../infrastructure/database/repositories/inventory-counting.repository';
import { InventoryCounting } from '../../../domain/entities/inventory-counting.entity';

@Injectable()
export class GetAllInventoryCountingsUseCase {
  constructor(
    private readonly inventoryCountingRepository: InventoryCountingRepository,
  ) {}

  async execute(): Promise<InventoryCounting[]> {
    return await this.inventoryCountingRepository.findAll();
  }
}
