import { Injectable } from '@nestjs/common';
import { InventoryTransferRepository } from '../../../infrastructure/database/repositories/inventory-transfer.repository';
import { InventoryTransfer } from '../../../domain/entities/inventory-transfer.entity';

@Injectable()
export class GetAllInventoryTransfersUseCase {
  constructor(
    private readonly inventoryTransferRepository: InventoryTransferRepository,
  ) {}

  async execute(): Promise<InventoryTransfer[]> {
    return await this.inventoryTransferRepository.findAll();
  }
}
