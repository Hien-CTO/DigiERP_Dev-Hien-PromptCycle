import { Injectable } from '@nestjs/common';
import { TypeOrmPurchaseRequestRepository } from '../../../infrastructure/database/repositories/purchase-request.repository';
import { PurchaseRequestResponseDto } from '../../dtos/purchase-request.dto';
import { PurchaseRequest } from '../../../domain/entities/purchase-request.entity';

@Injectable()
export class GetAllPurchaseRequestsUseCase {
  constructor(
    private readonly purchaseRequestRepository: TypeOrmPurchaseRequestRepository,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    warehouseId?: string,
  ): Promise<{ data: PurchaseRequestResponseDto[]; total: number }> {
    const result = await this.purchaseRequestRepository.findAll(
      page,
      limit,
      search,
      status,
      warehouseId,
    );

    return {
      data: result.data.map((request) => this.toResponseDto(request)),
      total: result.total,
    };
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

