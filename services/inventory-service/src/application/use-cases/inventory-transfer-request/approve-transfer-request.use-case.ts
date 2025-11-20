import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';
import { InventoryTransferRequest, TransferRequestStatus } from '../../../domain/entities/inventory-transfer-request.entity';

@Injectable()
export class ApproveTransferRequestUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(id: number, approvedBy: string, userId: number): Promise<InventoryTransferRequest> {
    const updateData: Partial<InventoryTransferRequest> = {
      status: TransferRequestStatus.APPROVED,
      approvedBy,
      updatedBy: userId,
    };

    return await this.transferRequestRepository.update(id, updateData);
  }
}
