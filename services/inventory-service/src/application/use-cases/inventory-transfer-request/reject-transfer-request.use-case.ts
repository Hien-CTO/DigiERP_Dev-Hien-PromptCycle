import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';
import { InventoryTransferRequest, TransferRequestStatus } from '../../../domain/entities/inventory-transfer-request.entity';

@Injectable()
export class RejectTransferRequestUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(id: number, approvedBy: string, userId: number): Promise<InventoryTransferRequest> {
    const updateData: Partial<InventoryTransferRequest> = {
      status: TransferRequestStatus.REJECTED,
      approvedBy,
      updatedBy: userId,
    };

    return await this.transferRequestRepository.update(id, updateData);
  }
}
