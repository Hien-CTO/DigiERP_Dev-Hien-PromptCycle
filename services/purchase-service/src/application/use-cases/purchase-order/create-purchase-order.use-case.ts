import { Injectable } from '@nestjs/common';
import { TypeOrmPurchaseOrderRepository } from '../../../infrastructure/database/repositories/purchase-order.repository';
import { CreatePurchaseOrderDto, PurchaseOrderResponseDto } from '../../dtos/purchase-order.dto';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../domain/entities/purchase-order.entity';

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    private readonly purchaseOrderRepository: TypeOrmPurchaseOrderRepository,
  ) {}

  async execute(dto: CreatePurchaseOrderDto, userId: number): Promise<PurchaseOrderResponseDto> {
    const orderNumber = await this.purchaseOrderRepository.generateOrderNumber();
    
    // Tính toán từng item với tax và discount
    let totalAmount = 0;
    let totalTaxAmount = 0;
    let totalDiscountAmount = 0;

    // Map để lưu thông tin tax và discount của từng item
    const itemTaxDiscountMap = new Map<number, { taxPercentage: number; discountPercentage: number; taxAmount: number; discountAmount: number }>();

    const items = dto.items.map((item, index) => {
      const itemSubtotal = item.quantity * item.unit_cost;
      const discountPercentage = item.discount_percentage || 0;
      const taxPercentage = item.tax_percentage || 0;
      
      const itemDiscountAmount = itemSubtotal * discountPercentage / 100;
      const itemAfterDiscount = itemSubtotal - itemDiscountAmount;
      const itemTaxAmount = itemAfterDiscount * taxPercentage / 100;
      const itemTotalAmount = itemAfterDiscount + itemTaxAmount;

      totalAmount += itemSubtotal;
      totalDiscountAmount += itemDiscountAmount;
      totalTaxAmount += itemTaxAmount;

      // Lưu thông tin tax và discount vào map
      itemTaxDiscountMap.set(index, {
        taxPercentage,
        discountPercentage,
        taxAmount: itemTaxAmount,
        discountAmount: itemDiscountAmount,
      });

      return {
        id: 0,
        purchaseOrderId: 0,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unit_cost,
        totalAmount: itemTotalAmount,
        discountPercentage,
        discountAmount: itemDiscountAmount,
        taxPercentage,
        taxAmount: itemTaxAmount,
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const finalAmount = totalAmount - totalDiscountAmount + totalTaxAmount;

    const purchaseOrder: Partial<PurchaseOrder> = {
      orderNumber,
      supplierId: dto.supplier_id,
      warehouseId: dto.warehouse_id,
      orderDate: new Date(dto.order_date),
      expectedDeliveryDate: dto.expected_delivery_date ? new Date(dto.expected_delivery_date) : undefined,
      predictedArrivalDate: dto.predicted_arrival_date ? new Date(dto.predicted_arrival_date) : undefined,
      status: PurchaseOrderStatus.DRAFT,
      totalAmount,
      taxAmount: totalTaxAmount,
      discountAmount: totalDiscountAmount,
      finalAmount,
      notes: dto.notes,
      paymentTerm: dto.payment_term,
      paymentMethod: dto.payment_method,
      portName: dto.port_name,
      importer: dto.importer
        ? {
            importerName: dto.importer.importer_name,
            importerPhone: dto.importer.importer_phone,
            importerFax: dto.importer.importer_fax,
            importerEmail: dto.importer.importer_email,
          }
        : undefined,
      items,
      createdBy: userId,
      updatedBy: userId,
    };

    const createdOrder = await this.purchaseOrderRepository.create(purchaseOrder as PurchaseOrder);
    return this.toResponseDto(createdOrder, itemTaxDiscountMap);
  }

  private toResponseDto(
    order: PurchaseOrder,
    itemTaxDiscountMap?: Map<number, { taxPercentage: number; discountPercentage: number; taxAmount: number; discountAmount: number }>
  ): PurchaseOrderResponseDto {
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
      items: order.items.map((item, index) => {
        // Ưu tiên lấy từ item, nếu không có thì lấy từ map (backward compatibility)
        const taxDiscountInfo = itemTaxDiscountMap?.get(index);
        const taxPercentage = item.taxPercentage ?? taxDiscountInfo?.taxPercentage ?? 0;
        const discountPercentage = item.discountPercentage ?? taxDiscountInfo?.discountPercentage ?? 0;
        const itemTaxAmount = item.taxAmount ?? taxDiscountInfo?.taxAmount ?? 0;
        const itemDiscountAmount = item.discountAmount ?? taxDiscountInfo?.discountAmount ?? 0;

        return {
          id: item.id.toString(),
          product_id: item.productId,
          product_name: item.productName,
          product_sku: item.productSku,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unitCost,
          tax_percentage: taxPercentage,
          tax_amount: itemTaxAmount,
          discount_percentage: discountPercentage,
          discount_amount: itemDiscountAmount,
          total_amount: item.totalAmount,
          received_quantity: 0,
          notes: item.notes,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
        };
      }),
    };
  }
}
