import { Injectable } from '@nestjs/common';
import { InventoryRevaluationRepository } from '../../../infrastructure/database/repositories/inventory-revaluation.repository';

@Injectable()
export class DeleteInventoryRevaluationUseCase {
  constructor(
    private readonly inventoryRevaluationRepository: InventoryRevaluationRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.inventoryRevaluationRepository.delete(id);
  }
}
