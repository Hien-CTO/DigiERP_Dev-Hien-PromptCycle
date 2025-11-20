import { Injectable } from '@nestjs/common';
import { SalesOrderRepository } from '../../../infrastructure/database/repositories/sales-order.repository';
import { SalesOrderItemRepository } from '../../../infrastructure/database/repositories/sales-order-item.repository';
import { OrderCreationDomainService } from '../../../domain/services/order-creation.domain.service';
import { OrderCreatedPublisher } from '../../../infrastructure/messaging/order-created.publisher';
import { CreateSalesOrderDto } from '../../dtos/sales-order.dto';
import { SalesOrder } from '../../../domain/entities/sales-order.entity';
import { SalesOrderItem } from '../../../domain/entities/sales-order-item.entity';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly salesOrderRepository: SalesOrderRepository,
    private readonly salesOrderItemRepository: SalesOrderItemRepository,
    private readonly orderCreationService: OrderCreationDomainService,
    private readonly orderCreatedPublisher: OrderCreatedPublisher,
  ) {}

  async execute(createOrderDto: CreateSalesOrderDto, userId: number): Promise<SalesOrder> {
    try {
      // 1. Create order using domain service
      const orderCreationResult = await this.orderCreationService.createOrder(createOrderDto, userId);

      // 2. Save order to database
      const savedOrder = await this.salesOrderRepository.save(orderCreationResult.order);

      // 3. Save order items
      const savedItems = [];
      for (const item of orderCreationResult.items) {
        const itemWithOrderId = new SalesOrderItem(
          item.id,
          savedOrder.id, // Set order ID
          item.productId,
          item.productSku,
          item.productName,
          item.productDescription,
          item.quantity,
          item.unitPrice,
          item.discountAmount,
          item.discountPercentage,
          item.lineTotal,
          item.unit,
          item.weight,
          item.notes,
          item.createdAt,
          item.updatedAt,
          item.createdBy,
          item.updatedBy,
        );
        const savedItem = await this.salesOrderItemRepository.save(itemWithOrderId);
        savedItems.push(savedItem);
      }

      // 4. Publish OrderCreated event
      await this.orderCreatedPublisher.publishOrderCreated({
        orderId: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        customerId: savedOrder.customerId,
        warehouseId: savedOrder.warehouseId,
        items: savedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        totalAmount: savedOrder.totalAmount,
        timestamp: new Date().toISOString(),
      });

      return savedOrder;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
}
