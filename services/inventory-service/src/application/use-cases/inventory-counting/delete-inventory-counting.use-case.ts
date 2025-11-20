import { Injectable } from '@nestjs/common';
import { InventoryCountingRepository } from '../../../infrastructure/database/repositories/inventory-counting.repository';

@Injectable()
export class DeleteInventoryCountingUseCase {
  constructor(
    private readonly inventoryCountingRepository: InventoryCountingRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.inventoryCountingRepository.delete(id);
  }
}
