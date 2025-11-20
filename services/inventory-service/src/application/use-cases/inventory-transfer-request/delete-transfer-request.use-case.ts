import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';

@Injectable()
export class DeleteTransferRequestUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.transferRequestRepository.delete(id);
  }
}
