import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmPurchaseRequestRepository } from '../../../infrastructure/database/repositories/purchase-request.repository';
import {
  RejectPurchaseRequestDto,
  PurchaseRequestResponseDto,
} from '../../dtos/purchase-request.dto';
import { PurchaseRequest } from '../../../domain/entities/purchase-request.entity';

@Injectable()
export class RejectPurchaseRequestUseCase {
  constructor(
    private readonly purchaseRequestRepository: TypeOrmPurchaseRequestRepository,
  ) {}

  async execute(
    id: string,
    dto: RejectPurchaseRequestDto,
    rejectedBy: string,
  ): Promise<PurchaseRequestResponseDto> {
    const request = await this.purchaseRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException(`Purchase request with ID ${id} not found`);
    }

    const rejectedRequest = request.reject(rejectedBy, dto.rejection_reason);
    const savedRequest = await this.purchaseRequestRepository.update(rejectedRequest);
    return this.toResponseDto(savedRequest);
  }

  private toResponseDto(request: PurchaseRequest): PurchaseRequestResponseDto {
    return {
      id: request.id,
      request_number: request.requestNumber,
      warehouse_id: request.warehouseId,
      status: request.status,
      request_date: request.requestDate,
      required_date: request.requiredDate,
      reason: request.reason,
      notes: request.notes,
      requested_by: request.requestedBy,
      approved_by: request.approvedBy,
      rejected_by: request.rejectedBy,
      approved_at: request.approvedAt,
      rejected_at: request.rejectedAt,
      rejection_reason: request.rejectionReason,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
      items: request.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        estimated_unit_cost: item.estimatedUnitCost,
        notes: item.notes,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })),
    };
  }
}

