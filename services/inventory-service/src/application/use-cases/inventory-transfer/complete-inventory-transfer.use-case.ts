import { Injectable } from '@nestjs/common';
import { InventoryTransferRepository } from '../../../infrastructure/database/repositories/inventory-transfer.repository';
import { InventoryTransfer, TransferStatus } from '../../../domain/entities/inventory-transfer.entity';

@Injectable()
export class CompleteInventoryTransferUseCase {
  constructor(
    private readonly inventoryTransferRepository: InventoryTransferRepository,
  ) {}

  async execute(id: number, receivedBy: string, userId: number): Promise<InventoryTransfer> {
    const updateData: Partial<InventoryTransfer> = {
      status: TransferStatus.COMPLETED,
      receivedBy,
      updatedBy: userId,
    };

    return await this.inventoryTransferRepository.update(id, updateData);
  }
}
