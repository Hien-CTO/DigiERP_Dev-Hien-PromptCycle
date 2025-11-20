import { Injectable } from '@nestjs/common';
import { InventoryPostingRepository } from '../../../infrastructure/database/repositories/inventory-posting.repository';
import { UpdateInventoryPostingDto } from '../../dtos/inventory-posting.dto';
import { InventoryPosting } from '../../../domain/entities/inventory-posting.entity';

@Injectable()
export class UpdateInventoryPostingUseCase {
  constructor(
    private readonly inventoryPostingRepository: InventoryPostingRepository,
  ) {}

  async execute(id: number, dto: UpdateInventoryPostingDto, userId: number): Promise<InventoryPosting> {
    const updateData: any = {
      updatedBy: userId,
    };

    if (dto.warehouseId) updateData.warehouseId = dto.warehouseId;
    if (dto.postingDate) updateData.postingDate = new Date(dto.postingDate);
    if (dto.status) updateData.status = dto.status;
    if (dto.postedBy) updateData.postedBy = dto.postedBy;
    if (dto.reason) updateData.reason = dto.reason;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.items) {
      updateData.items = dto.items.map(item => {
        const adjustmentAmount = (item.quantityAfter - item.quantityBefore) * item.unitCost;
        
        return {
          id: 0,
          postingId: id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          areaId: item.areaId,
          quantityBefore: item.quantityBefore,
          quantityAfter: item.quantityAfter,
          unit: item.unit,
          unitCost: item.unitCost,
          adjustmentAmount,
          reason: item.reason,
          notes: item.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    }

    return await this.inventoryPostingRepository.update(id, updateData);
  }
}
