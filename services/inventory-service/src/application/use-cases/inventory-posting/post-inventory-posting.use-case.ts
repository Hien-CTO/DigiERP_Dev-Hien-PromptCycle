import { Injectable } from '@nestjs/common';
import { InventoryPostingRepository } from '../../../infrastructure/database/repositories/inventory-posting.repository';
import { InventoryPosting, PostingStatus } from '../../../domain/entities/inventory-posting.entity';

@Injectable()
export class PostInventoryPostingUseCase {
  constructor(
    private readonly inventoryPostingRepository: InventoryPostingRepository,
  ) {}

  async execute(id: number, userId: number): Promise<InventoryPosting> {
    const updateData: Partial<InventoryPosting> = {
      status: PostingStatus.POSTED,
      updatedBy: userId,
    };

    return await this.inventoryPostingRepository.update(id, updateData);
  }
}
