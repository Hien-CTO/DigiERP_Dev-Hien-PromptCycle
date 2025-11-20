import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmPurchaseRequestRepository } from '../../../infrastructure/database/repositories/purchase-request.repository';
import {
  UpdatePurchaseRequestDto,
  PurchaseRequestResponseDto,
} from '../../dtos/purchase-request.dto';
import { PurchaseRequest } from '../../../domain/entities/purchase-request.entity';

@Injectable()
export class UpdatePurchaseRequestUseCase {
  constructor(
    private readonly purchaseRequestRepository: TypeOrmPurchaseRequestRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdatePurchaseRequestDto,
  ): Promise<PurchaseRequestResponseDto> {
    const existingRequest = await this.purchaseRequestRepository.findById(id);
    if (!existingRequest) {
      throw new NotFoundException(`Purchase request with ID ${id} not found`);
    }

    // Only allow update if status is DRAFT
    if (existingRequest.status !== 'DRAFT') {
      throw new Error('Only DRAFT requests can be updated');
    }

    // Update fields
    const updatedRequest = new PurchaseRequest(
      existingRequest.id,
      existingRequest.requestNumber,
      dto.warehouse_id || existingRequest.warehouseId,
      existingRequest.status,
      dto.request_date ? new Date(dto.request_date) : existingRequest.requestDate,
      dto.reason || existingRequest.reason,
      existingRequest.requestedBy,
      dto.required_date ? new Date(dto.required_date) : existingRequest.requiredDate,
      dto.notes !== undefined ? dto.notes : existingRequest.notes,
      existingRequest.approvedBy,
      existingRequest.rejectedBy,
      existingRequest.approvedAt,
      existingRequest.rejectedAt,
      existingRequest.rejectionReason,
      dto.items
        ? dto.items.map((item) => ({
            id: '',
            purchaseRequestId: existingRequest.id,
            productId: item.product_id,
            productName: item.product_name,
            productSku: item.product_sku,
            quantity: item.quantity,
            unit: item.unit,
            estimatedUnitCost: item.estimated_unit_cost,
            notes: item.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        : existingRequest.items,
      existingRequest.createdAt,
      new Date(),
    );

    const savedRequest = await this.purchaseRequestRepository.update(updatedRequest);
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

