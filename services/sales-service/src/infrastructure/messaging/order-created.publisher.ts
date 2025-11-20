import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

export interface OrderCreatedEvent {
  orderId: number;
  orderNumber: string;
  customerId: number;
  warehouseId: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  totalAmount: number;
  timestamp: string;
}

@Injectable()
export class OrderCreatedPublisher {
  private readonly logger = new Logger(OrderCreatedPublisher.name);
  private connection: any;
  private channel: any;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
      
      // Declare exchange
      await this.channel.assertExchange('order_exchange', 'topic', { durable: true });
      
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      if (!this.channel) {
        await this.initializeConnection();
      }

      const message = JSON.stringify(event);
      const routingKey = 'order.created';

      await this.channel.publish(
        'order_exchange',
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          messageId: `order-${event.orderId}`,
          timestamp: Date.now(),
        }
      );

      this.logger.log(`Published OrderCreated event for order ${event.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to publish OrderCreated event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }
}
