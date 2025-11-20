import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TypeOrmPurchaseRequestRepository } from '../../../infrastructure/database/repositories/purchase-request.repository';
import { TypeOrmPurchaseOrderRepository } from '../../../infrastructure/database/repositories/purchase-order.repository';
import {
  ConvertToPurchaseOrderDto,
} from '../../dtos/purchase-request.dto';
import {
  PurchaseOrderResponseDto,
} from '../../dtos/purchase-order.dto';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../domain/entities/purchase-order.entity';
import { CreatePurchaseOrderItemDto } from '../../dtos/purchase-order.dto';

@Injectable()
export class ConvertToPurchaseOrderUseCase {
  constructor(
    private readonly purchaseRequestRepository: TypeOrmPurchaseRequestRepository,
    private readonly purchaseOrderRepository: TypeOrmPurchaseOrderRepository,
  ) {}

  async execute(
    purchaseRequestId: string,
    dto: ConvertToPurchaseOrderDto,
    userId: number,
  ): Promise<PurchaseOrderResponseDto> {
    // Get purchase request
    const purchaseRequest = await this.purchaseRequestRepository.findById(purchaseRequestId);
    if (!purchaseRequest) {
      throw new NotFoundException(
        `Purchase request with ID ${purchaseRequestId} not found`,
      );
    }

    // Check if request is approved
    if (!purchaseRequest.canConvertToPurchaseOrder()) {
      throw new BadRequestException(
        'Only APPROVED purchase requests can be converted to purchase orders',
      );
    }

    // Generate order number
    const orderNumber = await this.purchaseOrderRepository.generateOrderNumber();

    // Convert items from purchase request to purchase order items
    const items: CreatePurchaseOrderItemDto[] = purchaseRequest.items.map((item) => {
      // Get price from dto.item_prices if provided, otherwise use estimated_unit_cost
      const itemPrice = dto.item_prices?.[item.productId.toString()];
      const unitCost = itemPrice?.unit_cost || item.estimatedUnitCost || 0;
      const discountPercentage = itemPrice?.discount_percentage || 0;
      const taxPercentage = itemPrice?.tax_percentage || 0;

      return {
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: unitCost,
        discount_percentage: discountPercentage,
        tax_percentage: taxPercentage,
        notes: item.notes,
      };
    });

    // Calculate totals
    let totalAmount = 0;
    let totalTaxAmount = 0;
    let totalDiscountAmount = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unit_cost;
      const itemDiscountAmount = (itemSubtotal * item.discount_percentage) / 100;
      const itemAfterDiscount = itemSubtotal - itemDiscountAmount;
      const itemTaxAmount = (itemAfterDiscount * item.tax_percentage) / 100;

      totalAmount += itemSubtotal;
      totalDiscountAmount += itemDiscountAmount;
      totalTaxAmount += itemTaxAmount;
    });

    const finalAmount = totalAmount - totalDiscountAmount + totalTaxAmount;

    // Create purchase order
    const importerInfo = dto.importer
      ? {
          importerName: dto.importer.importer_name,
          importerPhone: dto.importer.importer_phone,
          importerFax: dto.importer.importer_fax,
          importerEmail: dto.importer.importer_email,
        }
      : undefined;

    const purchaseOrder = PurchaseOrder.create(
      orderNumber,
      dto.supplier_id,
      Number(purchaseRequest.warehouseId),
      new Date(dto.order_date),
      dto.expected_delivery_date ? new Date(dto.expected_delivery_date) : undefined,
      dto.predicted_arrival_date ? new Date(dto.predicted_arrival_date) : undefined,
      dto.payment_term,
      dto.payment_method,
      dto.port_name, // portName
      importerInfo,
      dto.notes || purchaseRequest.notes,
      userId,
      purchaseRequestId, // Pass purchase_request_id to link PO with PR
    );

    // Add items
    const orderItems = items.map((item) => {
      const itemSubtotal = item.quantity * item.unit_cost;
      const itemDiscountAmount = (itemSubtotal * item.discount_percentage) / 100;
      const itemAfterDiscount = itemSubtotal - itemDiscountAmount;
      const itemTaxAmount = (itemAfterDiscount * item.tax_percentage) / 100;
      const itemTotalAmount = itemAfterDiscount + itemTaxAmount;

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
        discountPercentage: item.discount_percentage,
        discountAmount: itemDiscountAmount,
        taxPercentage: item.tax_percentage,
        taxAmount: itemTaxAmount,
        notes: item.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Update amounts
    const orderWithAmounts = purchaseOrder.updateAmounts(
      totalAmount,
      totalTaxAmount,
      totalDiscountAmount,
      finalAmount,
    );

    // Add items to order
    const orderWithItems = new PurchaseOrder(
      orderWithAmounts.id,
      orderWithAmounts.orderNumber,
      orderWithAmounts.supplierId,
      orderWithAmounts.warehouseId,
      orderWithAmounts.status,
      orderWithAmounts.orderDate,
      orderWithAmounts.expectedDeliveryDate,
      orderWithAmounts.predictedArrivalDate,
      orderWithAmounts.totalAmount,
      orderWithAmounts.taxAmount,
      orderWithAmounts.discountAmount,
      orderWithAmounts.finalAmount,
      orderWithAmounts.notes,
      orderWithAmounts.paymentTerm,
      orderWithAmounts.paymentMethod,
      orderWithAmounts.portName,
      orderWithAmounts.importer,
      orderItems,
      orderWithAmounts.createdBy,
      orderWithAmounts.updatedBy,
      orderWithAmounts.approvedBy,
      orderWithAmounts.approvedAt,
      orderWithAmounts.createdAt,
      orderWithAmounts.updatedAt,
      purchaseRequestId, // Pass purchase_request_id
    );

    // Save purchase order with purchase_request_id link
    const savedOrder = await this.purchaseOrderRepository.create(orderWithItems, purchaseRequestId);

    // Return response DTO
    return {
      id: savedOrder.id,
      order_number: savedOrder.orderNumber,
      supplier_id: Number(savedOrder.supplierId),
      warehouse_id: Number(savedOrder.warehouseId),
      status: savedOrder.status,
      order_date: savedOrder.orderDate,
      expected_delivery_date: savedOrder.expectedDeliveryDate,
      predicted_arrival_date: savedOrder.predictedArrivalDate,
      tax_amount: savedOrder.taxAmount,
      discount_amount: savedOrder.discountAmount,
      total_amount: savedOrder.totalAmount,
      final_amount: savedOrder.finalAmount,
      notes: savedOrder.notes,
      payment_term: savedOrder.paymentTerm,
      payment_method: savedOrder.paymentMethod,
      port_name: savedOrder.portName,
      purchase_request_id: savedOrder.purchaseRequestId,
      importer: savedOrder.importer
        ? {
            importer_name: savedOrder.importer.importerName,
            importer_phone: savedOrder.importer.importerPhone,
            importer_fax: savedOrder.importer.importerFax,
            importer_email: savedOrder.importer.importerEmail,
          }
        : undefined,
      created_by: savedOrder.createdBy,
      updated_by: savedOrder.updatedBy,
      approved_by: savedOrder.approvedBy,
      approved_at: savedOrder.approvedAt,
      created_at: savedOrder.createdAt,
      updated_at: savedOrder.updatedAt,
      items: orderItems.map((item) => ({
        id: item.id.toString(),
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost,
        tax_percentage: item.taxPercentage,
        tax_amount: item.taxAmount,
        discount_percentage: item.discountPercentage,
        discount_amount: item.discountAmount,
        total_amount: item.totalAmount,
        received_quantity: 0,
        notes: item.notes,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })),
    };
  }
}

