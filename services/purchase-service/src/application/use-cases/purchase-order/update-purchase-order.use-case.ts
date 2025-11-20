import { Injectable } from '@nestjs/common';
import { TypeOrmPurchaseOrderRepository } from '../../../infrastructure/database/repositories/purchase-order.repository';
import { UpdatePurchaseOrderDto, PurchaseOrderResponseDto } from '../../dtos/purchase-order.dto';
import { PurchaseOrder } from '../../../domain/entities/purchase-order.entity';

@Injectable()
export class UpdatePurchaseOrderUseCase {
  constructor(
    private readonly purchaseOrderRepository: TypeOrmPurchaseOrderRepository,
  ) {}

  async execute(id: string, dto: UpdatePurchaseOrderDto, userId: number): Promise<PurchaseOrderResponseDto> {
    const existingOrder = await this.purchaseOrderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Purchase order not found');
    }

    const updateData: Partial<PurchaseOrder> = {
      updatedBy: userId,
      updatedAt: new Date(),
    };

    // dùng (updateData as any) để lách readonly
    if (dto.order_number) (updateData as any).orderNumber = dto.order_number;
    if (dto.supplier_id) (updateData as any).supplierId = dto.supplier_id;
    if (dto.warehouse_id) (updateData as any).warehouseId = dto.warehouse_id;
    if (dto.order_date) (updateData as any).orderDate = new Date(dto.order_date);
    if (dto.expected_delivery_date) {
      (updateData as any).expectedDeliveryDate = new Date(dto.expected_delivery_date);
    }
    if (dto.predicted_arrival_date !== undefined) {
      (updateData as any).predictedArrivalDate =
        dto.predicted_arrival_date ? new Date(dto.predicted_arrival_date) : undefined;
    }
    if (dto.status) (updateData as any).status = dto.status;
    if (dto.notes !== undefined) (updateData as any).notes = dto.notes;
    if (dto.payment_term !== undefined) (updateData as any).paymentTerm = dto.payment_term;
    if (dto.payment_method !== undefined) (updateData as any).paymentMethod = dto.payment_method;
    if (dto.port_name !== undefined) (updateData as any).portName = dto.port_name;
    if (dto.importer) {
      (updateData as any).importer = {
        importerName: dto.importer.importer_name,
        importerPhone: dto.importer.importer_phone,
        importerFax: dto.importer.importer_fax,
        importerEmail: dto.importer.importer_email,
      };
    }

    // Note: UpdatePurchaseOrderDto doesn't have items property
    // This would need to be implemented separately if needed

    const updatedOrder = await this.purchaseOrderRepository.update(id, updateData);
    return this.toResponseDto(updatedOrder);
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
