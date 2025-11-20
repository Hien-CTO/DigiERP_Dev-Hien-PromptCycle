import { Injectable } from '@nestjs/common';
import { InventoryRevaluationRepository } from '../../../infrastructure/database/repositories/inventory-revaluation.repository';
import { InventoryRevaluation, RevaluationStatus } from '../../../domain/entities/inventory-revaluation.entity';

@Injectable()
export class PostInventoryRevaluationUseCase {
  constructor(
    private readonly inventoryRevaluationRepository: InventoryRevaluationRepository,
  ) {}

  async execute(id: number, userId: number): Promise<InventoryRevaluation> {
    const updateData: Partial<InventoryRevaluation> = {
      status: RevaluationStatus.POSTED,
      updatedBy: userId,
    };

    return await this.inventoryRevaluationRepository.update(id, updateData);
  }
}
