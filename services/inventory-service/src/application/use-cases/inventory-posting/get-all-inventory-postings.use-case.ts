import { Injectable } from '@nestjs/common';
import { InventoryPostingRepository } from '../../../infrastructure/database/repositories/inventory-posting.repository';
import { InventoryPosting } from '../../../domain/entities/inventory-posting.entity';

@Injectable()
export class GetAllInventoryPostingsUseCase {
  constructor(
    private readonly inventoryPostingRepository: InventoryPostingRepository,
  ) {}

  async execute(): Promise<InventoryPosting[]> {
    return await this.inventoryPostingRepository.findAll();
  }
}
