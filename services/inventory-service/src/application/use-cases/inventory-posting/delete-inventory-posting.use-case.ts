import { Injectable } from '@nestjs/common';
import { InventoryPostingRepository } from '../../../infrastructure/database/repositories/inventory-posting.repository';

@Injectable()
export class DeleteInventoryPostingUseCase {
  constructor(
    private readonly inventoryPostingRepository: InventoryPostingRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.inventoryPostingRepository.delete(id);
  }
}
