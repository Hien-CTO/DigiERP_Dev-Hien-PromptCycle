import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmPurchaseRequestRepository } from '../../../infrastructure/database/repositories/purchase-request.repository';

@Injectable()
export class DeletePurchaseRequestUseCase {
  constructor(
    private readonly purchaseRequestRepository: TypeOrmPurchaseRequestRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const request = await this.purchaseRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException(`Purchase request with ID ${id} not found`);
    }

    // Only allow delete if status is DRAFT or CANCELLED
    if (request.status !== 'DRAFT' && request.status !== 'CANCELLED') {
      throw new Error('Only DRAFT or CANCELLED requests can be deleted');
    }

    await this.purchaseRequestRepository.delete(id);
  }
}

