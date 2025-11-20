import { Injectable } from '@nestjs/common';
import { InventoryTransferRepository } from '../../../infrastructure/database/repositories/inventory-transfer.repository';
import { InventoryTransfer } from '../../../domain/entities/inventory-transfer.entity';

@Injectable()
export class GetInventoryTransferUseCase {
  constructor(
    private readonly inventoryTransferRepository: InventoryTransferRepository,
  ) {}

  async execute(id: number): Promise<InventoryTransfer | null> {
    return await this.inventoryTransferRepository.findById(id);
  }
}
