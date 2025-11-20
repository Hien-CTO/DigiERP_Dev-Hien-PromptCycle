import { Injectable } from '@nestjs/common';
import { TypeOrmPurchaseOrderRepository } from '../../../infrastructure/database/repositories/purchase-order.repository';
import { PurchaseOrder } from '../../../domain/entities/purchase-order.entity';
import { PurchaseOrderResponseDto } from '../../dtos/purchase-order.dto';

@Injectable()
export class GetPurchaseOrderUseCase {
  constructor(
    private readonly purchaseOrderRepository: TypeOrmPurchaseOrderRepository,
  ) {}

  async execute(id: string): Promise<PurchaseOrderResponseDto> {
    const order = await this.purchaseOrderRepository.findById(id);
    return this.toResponseDto(order);
  }

  private toResponseDto(order: PurchaseOrder): PurchaseOrderResponseDto {
    return {
      id: order.id,
      order_number: order.orderNumber,
      supplier_id: Number(order.supplierId),
      warehouse_id: Number(order.warehouseId),
      status: order.status,
      order_date: order.orderDate,
      expected_delivery_date: order.expectedDeliveryDate,
      predicted_arrival_date: order.predictedArrivalDate,
      tax_amount: order.taxAmount,
      discount_amount: order.discountAmount,
      total_amount: order.totalAmount,
      final_amount: order.finalAmount,
      notes: order.notes,
      payment_term: order.paymentTerm,
      payment_method: order.paymentMethod,
      port_name: order.portName,
      purchase_request_id: order.purchaseRequestId,
      importer: order.importer
        ? {
            importer_name: order.importer.importerName,
            importer_phone: order.importer.importerPhone,
            importer_fax: order.importer.importerFax,
            importer_email: order.importer.importerEmail,
          }
        : undefined,
      created_by: order.createdBy,
      updated_by: order.updatedBy,
      approved_by: order.approvedBy,
      approved_at: order.approvedAt,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id.toString(),
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost,
        tax_percentage: item.taxPercentage || 0,
        tax_amount: item.taxAmount || 0,
        discount_percentage: item.discountPercentage || 0,
        discount_amount: item.discountAmount || 0,
        total_amount: item.totalAmount,
        received_quantity: 0,
        notes: item.notes,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })),
    };
  }
}
