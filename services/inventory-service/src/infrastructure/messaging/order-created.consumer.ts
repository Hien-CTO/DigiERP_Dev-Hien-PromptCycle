import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from '../database/entities/inventory.entity';
import { InventoryMovement, MovementType, ReferenceType } from '../database/entities/inventory-movement.entity';
import { StockLevelChangedPublisher } from './stock-level-changed.publisher';

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
export class OrderCreatedConsumer {
  private readonly logger = new Logger(OrderCreatedConsumer.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    private readonly dataSource: DataSource,
    private readonly stockLevelChangedPublisher: StockLevelChangedPublisher,
  ) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Processing OrderCreated event for order ${event.orderId}`);

      for (const item of event.items) {
        // Check if inventory record exists
        let inventory = await queryRunner.manager.findOne(Inventory, {
          where: {
            product_id: item.productId,
            warehouse_id: event.warehouseId,
          },
        });

        if (!inventory) {
          // Create new inventory record
          inventory = queryRunner.manager.create(Inventory, {
            product_id: item.productId,
            warehouse_id: event.warehouseId,
            quantity_on_hand: 0,
            quantity_reserved: 0,
            quantity_available: 0,
            status: 'OUT_OF_STOCK',
          });
        }

        // Check if enough stock is available
        if (inventory.quantity_available < item.quantity) {
          this.logger.warn(`Insufficient stock for product ${item.productId}. Available: ${inventory.quantity_available}, Required: ${item.quantity}`);
          
          // Publish OrderCreationFailed event
          await this.publishOrderCreationFailed(event, `Insufficient stock for product ${item.productId}`);
          
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        // Update inventory
        const quantityBefore = inventory.quantity_available;
        inventory.quantity_reserved += item.quantity;
        inventory.quantity_available = inventory.quantity_on_hand - inventory.quantity_reserved;
        
        // Update status based on available quantity
        if (inventory.quantity_available <= 0) {
          inventory.status = 'OUT_OF_STOCK';
        } else if (inventory.quantity_available <= inventory.reorder_point) {
          inventory.status = 'LOW_STOCK';
        } else {
          inventory.status = 'IN_STOCK';
        }

        await queryRunner.manager.save(inventory);

        // Create inventory movement record
        const movement = queryRunner.manager.create(InventoryMovement, {
          product_id: item.productId,
          warehouse_id: event.warehouseId,
          movement_type: MovementType.OUT,
          reference_type: ReferenceType.SALES,
          reference_id: event.orderNumber,
          quantity: item.quantity,
          quantity_before: quantityBefore,
          quantity_after: inventory.quantity_available,
          notes: `Sales order ${event.orderNumber}`,
        });

        await queryRunner.manager.save(movement);

        // Publish StockLevelChanged event
        await this.stockLevelChangedPublisher.publishStockLevelChanged({
          productId: item.productId,
          warehouseId: event.warehouseId,
          quantityOnHand: inventory.quantity_on_hand,
          quantityAvailable: inventory.quantity_available,
          quantityReserved: inventory.quantity_reserved,
          unitCost: inventory.unit_cost,
          lastUpdated: new Date(),
        });
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Successfully processed OrderCreated event for order ${event.orderId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to process OrderCreated event: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async publishOrderCreationFailed(event: OrderCreatedEvent, reason: string): Promise<void> {
    // This would publish an OrderCreationFailed event
    // For now, we'll just log it
    this.logger.error(`Order creation failed for order ${event.orderId}: ${reason}`);
  }
}
