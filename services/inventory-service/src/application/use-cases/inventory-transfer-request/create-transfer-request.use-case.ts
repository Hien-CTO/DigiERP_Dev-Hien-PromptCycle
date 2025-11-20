import { Injectable } from '@nestjs/common';
import { InventoryTransferRequestRepository } from '../../../infrastructure/database/repositories/inventory-transfer-request.repository';
import { CreateTransferRequestDto } from '../../dtos/inventory-transfer-request.dto';
import { InventoryTransferRequest, TransferRequestStatus } from '../../../domain/entities/inventory-transfer-request.entity';

@Injectable()
export class CreateTransferRequestUseCase {
  constructor(
    private readonly transferRequestRepository: InventoryTransferRequestRepository,
  ) {}

  async execute(dto: CreateTransferRequestDto, userId: number): Promise<InventoryTransferRequest> {
    const requestNumber = await this.transferRequestRepository.generateRequestNumber();

    const transferRequest: Partial<InventoryTransferRequest> = {
      requestNumber,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      requestDate: new Date(dto.requestDate),
      status: TransferRequestStatus.DRAFT,
      requestedBy: dto.requestedBy,
      reason: dto.reason,
      notes: dto.notes,
      items: dto.items.map(item => ({
        id: 0,
        transferRequestId: 0,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdBy: userId,
      updatedBy: userId,
    };

    return await this.transferRequestRepository.create(transferRequest as InventoryTransferRequest);
  }
}
