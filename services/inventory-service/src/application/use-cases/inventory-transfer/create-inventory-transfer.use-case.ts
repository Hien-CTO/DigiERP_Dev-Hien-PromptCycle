import { Injectable } from '@nestjs/common';
import { InventoryTransferRepository } from '../../../infrastructure/database/repositories/inventory-transfer.repository';
import { CreateInventoryTransferDto } from '../../dtos/inventory-transfer.dto';
import { InventoryTransfer, TransferStatus } from '../../../domain/entities/inventory-transfer.entity';

@Injectable()
export class CreateInventoryTransferUseCase {
  constructor(
    private readonly inventoryTransferRepository: InventoryTransferRepository,
  ) {}

  async execute(dto: CreateInventoryTransferDto, userId: number): Promise<InventoryTransfer> {
    const transferNumber = await this.inventoryTransferRepository.generateTransferNumber();
    
    const totalAmount = dto.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    const inventoryTransfer: Partial<InventoryTransfer> = {
      transferNumber,
      transferRequestId: dto.transferRequestId,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      transferDate: new Date(dto.transferDate),
      status: TransferStatus.DRAFT,
      transferredBy: dto.transferredBy,
      reason: dto.reason,
      notes: dto.notes,
      items: dto.items.map(item => ({
        id: 0,
        transferId: 0,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalAmount: item.quantity * item.unitCost,
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdBy: userId,
      updatedBy: userId,
    };

    return await this.inventoryTransferRepository.create(inventoryTransfer as InventoryTransfer);
  }
}
