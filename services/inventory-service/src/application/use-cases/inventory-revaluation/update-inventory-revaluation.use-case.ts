import { Injectable } from '@nestjs/common';
import { InventoryRevaluationRepository } from '../../../infrastructure/database/repositories/inventory-revaluation.repository';
import { UpdateInventoryRevaluationDto } from '../../dtos/inventory-revaluation.dto';
import { InventoryRevaluation } from '../../../domain/entities/inventory-revaluation.entity';

@Injectable()
export class UpdateInventoryRevaluationUseCase {
  constructor(
    private readonly inventoryRevaluationRepository: InventoryRevaluationRepository,
  ) {}

  async execute(id: number, dto: UpdateInventoryRevaluationDto, userId: number): Promise<InventoryRevaluation> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.warehouseId) updateData.warehouseId = dto.warehouseId;
    if (dto.revaluationDate) updateData.revaluationDate = new Date(dto.revaluationDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.revaluedBy) updateData.revaluedBy = dto.revaluedBy;
    if (dto.reason) updateData.reason = dto.reason;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => {
        const revaluationAmount = (item.newUnitCost - item.oldUnitCost) * item.quantity;
        
        return {
          id: 0,
          revaluationId: id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          areaId: item.areaId,
          quantity: item.quantity,
          unit: item.unit,
          oldUnitCost: item.oldUnitCost,
          newUnitCost: item.newUnitCost,
          revaluationAmount,
          reason: item.reason,
          notes: item.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    }

    return await this.inventoryRevaluationRepository.update(id, updateData);
  }
}
