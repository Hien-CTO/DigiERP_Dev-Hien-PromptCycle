import { Injectable } from '@nestjs/common';
import { InventoryCountingRepository } from '../../../infrastructure/database/repositories/inventory-counting.repository';
import { CreateInventoryCountingDto } from '../../dtos/inventory-counting.dto';
import { InventoryCounting, CountingStatus } from '../../../domain/entities/inventory-counting.entity';

@Injectable()
export class CreateInventoryCountingUseCase {
  constructor(
    private readonly inventoryCountingRepository: InventoryCountingRepository,
  ) {}

  async execute(dto: CreateInventoryCountingDto, userId: number): Promise<InventoryCounting> {
    const countingNumber = await this.inventoryCountingRepository.generateCountingNumber();

    const inventoryCounting: Partial<InventoryCounting> = {
      countingNumber,
      warehouseId: dto.warehouseId,
      countingDate: new Date(dto.countingDate),
      status: CountingStatus.DRAFT,
      countedBy: dto.countedBy,
      reason: dto.reason,
      notes: dto.notes,
      items: dto.items.map(item => {
        const variance = item.countedQuantity - item.expectedQuantity;
        const varianceAmount = variance * item.unitCost;
        
        return {
          id: 0,
          countingId: 0,
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
      }),
      createdBy: userId,
      updatedBy: userId,
    };

    return await this.inventoryCountingRepository.create(inventoryCounting as InventoryCounting);
  }
}
