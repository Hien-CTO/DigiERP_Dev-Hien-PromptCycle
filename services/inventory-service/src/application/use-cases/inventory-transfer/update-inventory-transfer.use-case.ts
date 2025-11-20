import { Injectable } from '@nestjs/common';
import { InventoryTransferRepository } from '../../../infrastructure/database/repositories/inventory-transfer.repository';
import { UpdateInventoryTransferDto } from '../../dtos/inventory-transfer.dto';
import { InventoryTransfer } from '../../../domain/entities/inventory-transfer.entity';

@Injectable()
export class UpdateInventoryTransferUseCase {
  constructor(
    private readonly inventoryTransferRepository: InventoryTransferRepository,
  ) {}

  async execute(id: number, dto: UpdateInventoryTransferDto, userId: number): Promise<InventoryTransfer> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.fromWarehouseId) updateData.fromWarehouseId = dto.fromWarehouseId;
    if (dto.toWarehouseId) updateData.toWarehouseId = dto.toWarehouseId;
    if (dto.transferDate) updateData.transferDate = new Date(dto.transferDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.transferredBy) updateData.transferredBy = dto.transferredBy;
    if (dto.receivedBy) updateData.receivedBy = dto.receivedBy;
    if (dto.reason) updateData.reason = dto.reason;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => ({
        id: 0,
        transferId: id,
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
      }));
    }

    return await this.inventoryTransferRepository.update(id, updateData);
  }
}
