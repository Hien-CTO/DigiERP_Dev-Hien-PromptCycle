import { Injectable } from '@nestjs/common';
import { InventoryRevaluationRepository } from '../../../infrastructure/database/repositories/inventory-revaluation.repository';
import { InventoryRevaluation } from '../../../domain/entities/inventory-revaluation.entity';

@Injectable()
export class GetAllInventoryRevaluationsUseCase {
  constructor(
    private readonly inventoryRevaluationRepository: InventoryRevaluationRepository,
  ) {}

  async execute(): Promise<InventoryRevaluation[]> {
    return await this.inventoryRevaluationRepository.findAll();
  }
}
