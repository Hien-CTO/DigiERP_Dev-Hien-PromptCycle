import { Injectable } from '@nestjs/common';
import { InventoryRevaluationRepository } from '../../../infrastructure/database/repositories/inventory-revaluation.repository';
import { InventoryRevaluation } from '../../../domain/entities/inventory-revaluation.entity';

@Injectable()
export class GetInventoryRevaluationUseCase {
  constructor(
    private readonly inventoryRevaluationRepository: InventoryRevaluationRepository,
  ) {}

  async execute(id: number): Promise<InventoryRevaluation | null> {
    return await this.inventoryRevaluationRepository.findById(id);
  }
}
