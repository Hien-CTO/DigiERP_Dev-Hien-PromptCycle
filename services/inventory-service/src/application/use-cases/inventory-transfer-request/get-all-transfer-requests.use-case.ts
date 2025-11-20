import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';
import { InventoryTransferRequest } from '../../../domain/entities/inventory-transfer-request.entity';

@Injectable()
export class GetAllTransferRequestsUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(): Promise<InventoryTransferRequest[]> {
    return await this.transferRequestRepository.findAll();
  }
}
