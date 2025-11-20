import { Injectable } from '@nestjs/common';
import { InventoryCountingRepository } from '../../../infrastructure/database/repositories/inventory-counting.repository';
import { InventoryCounting, CountingStatus } from '../../../domain/entities/inventory-counting.entity';

@Injectable()
export class CompleteInventoryCountingUseCase {
  constructor(
    private readonly inventoryCountingRepository: InventoryCountingRepository,
  ) {}

  async execute(id: number, reviewedBy: string, userId: number): Promise<InventoryCounting> {
    const updateData: Partial<InventoryCounting> = {
      status: CountingStatus.COMPLETED,
      reviewedBy,
      updatedBy: userId,
    };

    return await this.inventoryCountingRepository.update(id, updateData);
  }
}
