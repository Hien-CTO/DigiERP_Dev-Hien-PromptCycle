import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';
import { UpdateTransferRequestDto } from '../../dtos/inventory-transfer-request.dto';
import { InventoryTransferRequest } from '../../../domain/entities/inventory-transfer-request.entity';

@Injectable()
export class UpdateTransferRequestUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(id: number, dto: UpdateTransferRequestDto, userId: number): Promise<InventoryTransferRequest> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.fromWarehouseId) updateData.fromWarehouseId = dto.fromWarehouseId;
    if (dto.toWarehouseId) updateData.toWarehouseId = dto.toWarehouseId;
    if (dto.requestDate) updateData.requestDate = new Date(dto.requestDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.requestedBy) updateData.requestedBy = dto.requestedBy;
    if (dto.approvedBy) updateData.approvedBy = dto.approvedBy;
    if (dto.reason) updateData.reason = dto.reason;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => ({
        id: 0,
        transferRequestId: id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return await this.transferRequestRepository.update(id, updateData);
  }
}
