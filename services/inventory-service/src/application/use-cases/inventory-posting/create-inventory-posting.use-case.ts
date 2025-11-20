import { Injectable } from '@nestjs/common';
import { InventoryPostingRepository } from '../../../infrastructure/database/repositories/inventory-posting.repository';
import { CreateInventoryPostingDto } from '../../dtos/inventory-posting.dto';
import { InventoryPosting, PostingStatus } from '../../../domain/entities/inventory-posting.entity';

@Injectable()
export class CreateInventoryPostingUseCase {
  constructor(
    private readonly inventoryPostingRepository: InventoryPostingRepository,
  ) {}

  async execute(dto: CreateInventoryPostingDto, userId: number): Promise<InventoryPosting> {
    const postingNumber = await this.inventoryPostingRepository.generatePostingNumber();

    const inventoryPosting: Partial<InventoryPosting> = {
      postingNumber,
      countingId: dto.countingId,
      warehouseId: dto.warehouseId,
      postingDate: new Date(dto.postingDate),
      status: PostingStatus.DRAFT,
      postedBy: dto.postedBy,
      reason: dto.reason,
      notes: dto.notes,
      items: dto.items.map(item => {
        const adjustmentAmount = (item.quantityAfter - item.quantityBefore) * item.unitCost;
        
        return {
          id: 0,
          postingId: 0,
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
      }),
      createdBy: userId,
      updatedBy: userId,
    };

    return await this.inventoryPostingRepository.create(inventoryPosting as InventoryPosting);
  }
}
