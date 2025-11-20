import { Injectable } from '@nestjs/common';
import { InventoryTransferRepository } from '../../../infrastructure/database/repositories/inventory-transfer.repository';

@Injectable()
export class DeleteInventoryTransferUseCase {
  constructor(
    private readonly inventoryTransferRepository: InventoryTransferRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.inventoryTransferRepository.delete(id);
  }
}
