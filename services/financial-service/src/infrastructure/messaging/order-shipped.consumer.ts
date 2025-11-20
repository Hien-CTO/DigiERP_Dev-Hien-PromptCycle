import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateInvoiceUseCase } from '../../application/use-cases/invoice/create-invoice.use-case';

export interface OrderShippedEvent {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerTaxCode?: string;
  items: {
    productId: string;
    productName: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  warehouseId: string;
  shippedAt: Date;
}

@Injectable()
export class OrderShippedConsumer {
  private readonly logger = new Logger(OrderShippedConsumer.name);

  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
  ) {}

  @OnEvent('order.shipped')
  async handleOrderShipped(event: OrderShippedEvent): Promise<void> {
    try {
      this.logger.log(`Processing OrderShipped event for order ${event.orderId}`);

      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber();

      // Calculate due date (30 days from shipping date)
      const dueDate = new Date(event.shippedAt);
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice from order
      const invoice = await this.createInvoiceUseCase.execute({
        invoice_number: invoiceNumber,
        type: 'SALES' as any,
        customer_id: event.customerId,
        customer_name: event.customerName,
        customer_email: event.customerEmail,
        customer_address: event.customerAddress,
        customer_tax_code: event.customerTaxCode,
        order_id: event.orderId,
        order_number: event.orderNumber,
        invoice_date: event.shippedAt.toISOString(),
        due_date: dueDate.toISOString(),
        items: event.items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          product_sku: item.productSku,
          description: `${item.productName} - ${item.quantity} units`,
          quantity: item.quantity,
          unit: 'pcs',
          unit_price: item.unitPrice,
          discount_percentage: 0,
          tax_percentage: 10, // Default tax rate
        })),
        subtotal: event.totalAmount - event.taxAmount,
        tax_amount: event.taxAmount,
        discount_amount: event.discountAmount,
        total_amount: event.totalAmount,
        notes: `Auto-generated invoice for order ${event.orderNumber}`,
        terms_conditions: 'Payment due within 30 days',
      });

      this.logger.log(`Created invoice ${invoice.invoiceNumber} for order ${event.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process OrderShipped event: ${error.message}`, error.stack);
      // In a real application, you might want to publish this to a dead letter queue
      // or retry mechanism
    }
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }
}
