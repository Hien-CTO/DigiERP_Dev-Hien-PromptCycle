import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryRepository } from '../database/repositories/inventory.repository';
import { StockLevelChangedPublisher } from './stock-level-changed.publisher';

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
export class GoodsReceivedConsumer {
  private readonly logger = new Logger(GoodsReceivedConsumer.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly stockLevelChangedPublisher: StockLevelChangedPublisher,
  ) {}

  @OnEvent('goods.received')
  async handleGoodsReceived(event: GoodsReceivedEvent): Promise<void> {
    try {
      this.logger.log(`Processing GoodsReceived event for receipt ${event.receiptId}`);

      // Process each item in the goods receipt
      for (const item of event.items) {
        // Check if inventory record exists for this product and warehouse
        let inventory = await this.inventoryRepository.findByProductAndWarehouse(
          parseInt(item.productId),
          parseInt(event.warehouseId),
        );

        if (!inventory) {
          // Create new inventory record
          inventory = {
            id: 0,
            productId: parseInt(item.productId),
            warehouseId: parseInt(event.warehouseId),
            quantityOnHand: 0,
            quantityReserved: 0,
            quantityAvailable: 0,
            reorderPoint: 0,
            reorderQuantity: 0,
            unitCost: item.unitCost,
            status: 'ACTIVE',
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 0,
            updatedBy: 0,
          };
        }

        // Update inventory quantities
        const updatedInventory = {
          ...inventory,
          quantityOnHand: inventory.quantityOnHand + item.quantity,
          quantityAvailable: (inventory.quantityOnHand + item.quantity) - inventory.quantityReserved,
          unitCost: item.unitCost, // Update unit cost
          lastUpdated: new Date(),
        };

        // Save updated inventory
        await this.inventoryRepository.save(updatedInventory);

        // TODO: Create inventory movement record when movement entity is implemented
        // await this.inventoryRepository.createMovement({
        //   productId: parseInt(item.productId),
        //   warehouseId: parseInt(event.warehouseId),
        //   movementType: 'IN',
        //   quantity: item.quantity,
        //   unitCost: item.unitCost,
        //   referenceType: 'PURCHASE',
        //   referenceId: event.receiptId,
        //   notes: `Goods received from purchase receipt ${event.receiptId}`,
        // });

        // Publish StockLevelChanged event
        await this.stockLevelChangedPublisher.publishStockLevelChanged({
          productId: parseInt(item.productId),
          warehouseId: parseInt(event.warehouseId),
          quantityOnHand: updatedInventory.quantityOnHand,
          quantityAvailable: updatedInventory.quantityAvailable,
          quantityReserved: updatedInventory.quantityReserved,
          unitCost: item.unitCost,
          lastUpdated: new Date(),
        });

        this.logger.log(`Updated inventory for product ${item.productId} in warehouse ${event.warehouseId}: +${item.quantity} units`);
      }

      this.logger.log(`Successfully processed GoodsReceived event for receipt ${event.receiptId}`);
    } catch (error) {
      this.logger.error(`Failed to process GoodsReceived event: ${error.message}`, error.stack);
      // In a real application, you might want to publish this to a dead letter queue
      // or retry mechanism
      throw error;
    }
  }
}
