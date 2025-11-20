import { Injectable } from '@nestjs/common';
import { InventoryPostingRepository } from '../../../infrastructure/database/repositories/inventory-posting.repository';
import { InventoryPosting } from '../../../domain/entities/inventory-posting.entity';

@Injectable()
export class GetInventoryPostingUseCase {
  constructor(
    private readonly inventoryPostingRepository: InventoryPostingRepository,
  ) {}

  async execute(id: number): Promise<InventoryPosting | null> {
    return await this.inventoryPostingRepository.findById(id);
  }
}
