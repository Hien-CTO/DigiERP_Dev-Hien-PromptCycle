import { Injectable } from '@nestjs/common';
import { InventoryRevaluationRepository } from '../../../infrastructure/database/repositories/inventory-revaluation.repository';
import { CreateInventoryRevaluationDto } from '../../dtos/inventory-revaluation.dto';
import { InventoryRevaluation, RevaluationStatus } from '../../../domain/entities/inventory-revaluation.entity';

@Injectable()
export class CreateInventoryRevaluationUseCase {
  constructor(
    private readonly inventoryRevaluationRepository: InventoryRevaluationRepository,
  ) {}

  async execute(dto: CreateInventoryRevaluationDto, userId: number): Promise<InventoryRevaluation> {
    const revaluationNumber = await this.inventoryRevaluationRepository.generateRevaluationNumber();

    const inventoryRevaluation: Partial<InventoryRevaluation> = {
      revaluationNumber,
      warehouseId: dto.warehouseId,
      revaluationDate: new Date(dto.revaluationDate),
      status: RevaluationStatus.DRAFT,
      revaluedBy: dto.revaluedBy,
      reason: dto.reason,
      notes: dto.notes,
      items: dto.items.map(item => {
        const revaluationAmount = (item.newUnitCost - item.oldUnitCost) * item.quantity;
        
        return {
          id: 0,
          revaluationId: 0,
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
      }),
      createdBy: userId,
      updatedBy: userId,
    };

    return await this.inventoryRevaluationRepository.create(inventoryRevaluation as InventoryRevaluation);
  }
}
