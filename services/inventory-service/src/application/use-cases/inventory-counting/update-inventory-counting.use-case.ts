import { Injectable } from '@nestjs/common';
import { InventoryCountingRepository } from '../../../infrastructure/database/repositories/inventory-counting.repository';
import { UpdateInventoryCountingDto } from '../../dtos/inventory-counting.dto';
import { InventoryCounting } from '../../../domain/entities/inventory-counting.entity';

@Injectable()
export class UpdateInventoryCountingUseCase {
  constructor(
    private readonly inventoryCountingRepository: InventoryCountingRepository,
  ) {}

  async execute(id: number, dto: UpdateInventoryCountingDto, userId: number): Promise<InventoryCounting> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.warehouseId) updateData.warehouseId = dto.warehouseId;
    if (dto.countingDate) updateData.countingDate = new Date(dto.countingDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.countedBy) updateData.countedBy = dto.countedBy;
    if (dto.reviewedBy) updateData.reviewedBy = dto.reviewedBy;
    if (dto.reason) updateData.reason = dto.reason;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => {
        const variance = item.countedQuantity - item.expectedQuantity;
        const varianceAmount = variance * item.unitCost;
        
        return {
          id: 0,
          countingId: id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          areaId: item.areaId,
          expectedQuantity: item.expectedQuantity,
          countedQuantity: item.countedQuantity,
          unit: item.unit,
          unitCost: item.unitCost,
          variance,
          varianceAmount,
          notes: item.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    }

    return await this.inventoryCountingRepository.update(id, updateData);
  }
}
