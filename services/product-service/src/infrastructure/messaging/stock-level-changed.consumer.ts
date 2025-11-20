import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product as ProductEntity } from "../database/entities/product.entity";

export interface StockLevelChangedEvent {
  productId: number;
  warehouseId: number;
  quantityAvailable: number;
  quantityReserved: number;
  stockStatus: string;
  timestamp: string;
}

@Injectable()
export class StockLevelChangedConsumer {
  private readonly logger = new Logger(StockLevelChangedConsumer.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async handleStockLevelChanged(event: StockLevelChangedEvent): Promise<void> {
    try {
      this.logger.log(
        `Processing stock level changed event for product ${event.productId}`,
      );

      // Update product stock status
      await this.productRepository.update(
        { id: event.productId },
        {
          stock_status_id: this.stockStatusToNumber(event.stockStatus),
          updated_at: new Date(),
        },
      );

      this.logger.log(
        `Updated stock status for product ${event.productId} to ${event.stockStatus}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process stock level changed event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private stockStatusToNumber(stockStatus: string): number {
    const stockStatusMap: Record<string, number> = {
      'IN_STOCK': 1,
      'OUT_OF_STOCK': 2,
      'LOW_STOCK': 3,
      'ON_ORDER': 4,
    };
    return stockStatusMap[stockStatus] || 1;
  }
}
