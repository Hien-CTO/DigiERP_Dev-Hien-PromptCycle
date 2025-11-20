import { Injectable } from '@nestjs/common';
import { TypeOrmPurchaseRequestRepository } from '../../../infrastructure/database/repositories/purchase-request.repository';
import {
  CreatePurchaseRequestDto,
  PurchaseRequestResponseDto,
} from '../../dtos/purchase-request.dto';
import { PurchaseRequest } from '../../../domain/entities/purchase-request.entity';

@Injectable()
export class CreatePurchaseRequestUseCase {
  constructor(
    private readonly purchaseRequestRepository: TypeOrmPurchaseRequestRepository,
  ) {}

  async execute(
    dto: CreatePurchaseRequestDto,
    userId: string,
  ): Promise<PurchaseRequestResponseDto> {
    // Generate request number if not provided
    let requestNumber = dto.request_number;
    if (!requestNumber) {
      requestNumber = await this.purchaseRequestRepository.generateRequestNumber();
    } else {
      // Check if request number already exists
      const existing = await this.purchaseRequestRepository.findByRequestNumber(
        requestNumber,
      );
      if (existing) {
        throw new Error(`Request number ${requestNumber} already exists`);
      }
    }

    const items = dto.items.map((item) => ({
      id: '',
      purchaseRequestId: '',
      productId: item.product_id,
      productName: item.product_name,
      productSku: item.product_sku,
      quantity: item.quantity,
      unit: item.unit,
      estimatedUnitCost: item.estimated_unit_cost,
      notes: item.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const purchaseRequest = PurchaseRequest.create(
      requestNumber,
      dto.warehouse_id,
      new Date(dto.request_date),
      dto.reason,
      userId,
      dto.required_date ? new Date(dto.required_date) : undefined,
      dto.notes,
    );

    // Add items to the request
    const requestWithItems = new PurchaseRequest(
      purchaseRequest.id,
      purchaseRequest.requestNumber,
      purchaseRequest.warehouseId,
      purchaseRequest.status,
      purchaseRequest.requestDate,
      purchaseRequest.reason,
      purchaseRequest.requestedBy,
      purchaseRequest.requiredDate,
      purchaseRequest.notes,
      purchaseRequest.approvedBy,
      purchaseRequest.rejectedBy,
      purchaseRequest.approvedAt,
      purchaseRequest.rejectedAt,
      purchaseRequest.rejectionReason,
      items,
      purchaseRequest.createdAt,
      purchaseRequest.updatedAt,
    );

    const createdRequest = await this.purchaseRequestRepository.create(requestWithItems);
    return this.toResponseDto(createdRequest);
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

