import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SalesOrder } from '../entities/sales-order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { SalesOrderItem } from '../entities/sales-order-item.entity';
import { CreateSalesOrderDto, CreateSalesOrderItemDto } from '../../application/dtos/sales-order.dto';

export interface ProductPriceInfo {
  price: number;
  priceType: string;
  discountAmount: number;
  finalPrice: number;
  appliedPriceId: number;
}

export interface OrderCreationResult {
  order: SalesOrder;
  items: SalesOrderItem[];
  totalAmount: number;
}

@Injectable()
export class OrderCreationDomainService {
  constructor(private readonly httpService: HttpService) {}

  async createOrder(
    createOrderDto: CreateSalesOrderDto,
    userId: number,
  ): Promise<OrderCreationResult> {
    // 1. Validate customer exists (would call customer service)
    await this.validateCustomer(createOrderDto.customerId);

    // 2. Validate products and calculate prices
    const validatedItems = await this.validateAndCalculatePrices(createOrderDto.items, createOrderDto.customerId);

    // 3. Calculate totals
    const subtotal = validatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalAmount = subtotal + (createOrderDto.taxAmount || 0) + (createOrderDto.shippingAmount || 0) - (createOrderDto.discountAmount || 0);

    // 4. Generate order number
    const orderNumber = this.generateOrderNumber();

    // 5. Create order entity
    const order = new SalesOrder(
      null, // id will be set by database
      orderNumber,
      createOrderDto.customerId,
      createOrderDto.customerName || '',
      createOrderDto.customerEmail || '',
      createOrderDto.customerPhone || '',
      createOrderDto.warehouseId || 1,
      createOrderDto.status || OrderStatus.PENDING,
      createOrderDto.paymentStatus || PaymentStatus.PENDING,
      subtotal,
      createOrderDto.taxAmount || 0,
      createOrderDto.discountAmount || 0,
      createOrderDto.shippingAmount || 0,
      totalAmount,
      createOrderDto.currency || 'VND',
      createOrderDto.notes || '',
      createOrderDto.internalNotes || '',
      createOrderDto.orderDate ? new Date(createOrderDto.orderDate) : new Date(),
      createOrderDto.requiredDate ? new Date(createOrderDto.requiredDate) : null,
      null, // shippedDate
      null, // deliveredDate
      createOrderDto.shippingAddress || '',
      createOrderDto.billingAddress || '',
      createOrderDto.shippingMethod || '',
      createOrderDto.paymentMethod || '',
      '', // trackingNumber
      new Date(), // createdAt
      new Date(), // updatedAt
      userId, // createdBy
      userId, // updatedBy
    );

    // 6. Create order items
    const items = validatedItems.map((item, index) => new SalesOrderItem(
      null, // id will be set by database
      null, // orderId will be set after order is saved
      item.productId,
      item.productSku,
      item.productName,
      item.productDescription || '',
      item.quantity,
      item.unitPrice,
      item.discountAmount || 0,
      item.discountPercentage || 0,
      item.lineTotal,
      item.unit || '',
      item.weight || 0,
      item.notes || '',
      new Date(), // createdAt
      new Date(), // updatedAt
      userId, // createdBy
      userId, // updatedBy
    ));

    return {
      order,
      items,
      totalAmount,
    };
  }

  private async validateCustomer(customerId: number): Promise<void> {
    try {
      // This would call customer service to validate customer exists
      // For now, we'll assume customer exists
      console.log(`Validating customer ${customerId}`);
    } catch (error) {
      throw new Error(`Customer ${customerId} not found`);
    }
  }

  private async validateAndCalculatePrices(
    items: CreateSalesOrderItemDto[],
    customerId: number,
  ): Promise<any[]> {
    const validatedItems = [];

    for (const item of items) {
      try {
        // Get product price from product service
        const priceInfo = await this.getProductPrice(item.productId, customerId, item.quantity);
        
        // Get product details
        const productInfo = await this.getProductInfo(item.productId);

        validatedItems.push({
          ...item,
          productSku: productInfo.sku,
          productName: productInfo.name,
          productDescription: productInfo.description,
          unitPrice: priceInfo.finalPrice,
          discountAmount: priceInfo.discountAmount,
          lineTotal: priceInfo.finalPrice * item.quantity,
          unit: productInfo.unit,
          weight: productInfo.weight,
        });
      } catch (error) {
        throw new Error(`Failed to validate product ${item.productId}: ${error.message}`);
      }
    }

    return validatedItems;
  }

  private async getProductPrice(
    productId: number,
    customerId: number,
    quantity: number,
  ): Promise<ProductPriceInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${process.env.PRODUCT_SERVICE_URL}/products/${productId}/price?customerId=${customerId}&quantity=${quantity}`
        )
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get price for product ${productId}`);
    }
  }

  private async getProductInfo(productId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.PRODUCT_SERVICE_URL}/products/${productId}`)
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get product info for product ${productId}`);
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SO-${timestamp}-${random}`;
  }
}
