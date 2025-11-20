import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';
import { InventoryTransferRequest } from '../../../domain/entities/inventory-transfer-request.entity';

@Injectable()
export class GetTransferRequestUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(id: number): Promise<InventoryTransferRequest | null> {
    return await this.transferRequestRepository.findById(id);
  }
}
