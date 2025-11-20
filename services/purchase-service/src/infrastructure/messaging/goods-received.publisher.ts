import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export interface GoodsReceivedEvent {
  receiptId: string;
  warehouseId: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
}

@Injectable()
export class GoodsReceivedPublisher {
  private readonly logger = new Logger(GoodsReceivedPublisher.name);
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
        queue: 'goods_received_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async publishGoodsReceived(event: GoodsReceivedEvent): Promise<void> {
    try {
      await this.client.emit('goods.received', event).toPromise();
      this.logger.log(`Published GoodsReceived event for receipt ${event.receiptId}`);
    } catch (error) {
      this.logger.error(`Failed to publish GoodsReceived event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
