import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

export interface StockLevelChangedEvent {
  productId: number;
  warehouseId: number;
  quantityOnHand: number;
  quantityAvailable: number;
  quantityReserved: number;
  unitCost: number;
  lastUpdated: Date;
}

@Injectable()
export class StockLevelChangedPublisher {
  private readonly logger = new Logger(StockLevelChangedPublisher.name);
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
      await this.channel.assertExchange('inventory_exchange', 'topic', { durable: true });
      
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async publishStockLevelChanged(event: StockLevelChangedEvent): Promise<void> {
    try {
      if (!this.channel) {
        await this.initializeConnection();
      }

      const message = JSON.stringify(event);
      const routingKey = 'stock.level.changed';

      await this.channel.publish(
        'inventory_exchange',
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          messageId: `stock-${event.productId}-${event.warehouseId}`,
          timestamp: Date.now(),
        }
      );

      this.logger.log(`Published StockLevelChanged event for product ${event.productId} in warehouse ${event.warehouseId}`);
    } catch (error) {
      this.logger.error(`Failed to publish StockLevelChanged event: ${error.message}`, error.stack);
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
