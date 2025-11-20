import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory as InventoryEntity } from '../entities/inventory.entity';
import { InventoryRepository as IInventoryRepository } from '../../../domain/repositories/inventory.repository.interface';
import { Inventory } from '../../../domain/entities/inventory.entity';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
  ) {}

  async findById(id: number): Promise<Inventory | null> {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    return inventory ? this.toDomain(inventory) : null;
  }

  async findByProductAndWarehouse(productId: number, warehouseId: number): Promise<Inventory | null> {
    const inventory = await this.inventoryRepo.findOne({ 
      where: { 
        product_id: productId, 
        warehouse_id: warehouseId 
      } 
    });
    return inventory ? this.toDomain(inventory) : null;
  }

  async findByProductId(productId: number): Promise<Inventory[]> {
    const inventories = await this.inventoryRepo.find({ where: { product_id: productId } });
    return inventories.map(inventory => this.toDomain(inventory));
  }

  async findByWarehouseId(warehouseId: number): Promise<Inventory[]> {
    const inventories = await this.inventoryRepo.find({ where: { warehouse_id: warehouseId } });
    return inventories.map(inventory => this.toDomain(inventory));
  }

  async save(inventory: Inventory): Promise<Inventory> {
    const inventoryEntity = this.toEntity(inventory);
    const savedInventory = await this.inventoryRepo.save(inventoryEntity);
    return this.toDomain(savedInventory);
  }

  async update(id: number, inventory: Partial<Inventory>): Promise<Inventory> {
    await this.inventoryRepo.update(id, this.toEntity(inventory as Inventory));
    const updatedInventory = await this.inventoryRepo.findOne({ where: { id } });
    return this.toDomain(updatedInventory);
  }

  async delete(id: number): Promise<void> {
    await this.inventoryRepo.delete(id);
  }

  private toDomain(entity: InventoryEntity): Inventory {
    return new Inventory(
      entity.id,
      entity.product_id,
      entity.warehouse_id,
      entity.quantity_on_hand,
      entity.quantity_reserved,
      entity.quantity_available,
      entity.reorder_point,
      entity.reorder_quantity,
      entity.unit_cost,
      entity.status,
      entity.notes,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: Inventory): InventoryEntity {
    const entity = new InventoryEntity();
    entity.id = domain.id;
    entity.product_id = domain.productId;
    entity.warehouse_id = domain.warehouseId;
    entity.quantity_on_hand = domain.quantityOnHand;
    entity.quantity_reserved = domain.quantityReserved;
    entity.quantity_available = domain.quantityAvailable;
    entity.reorder_point = domain.reorderPoint;
    entity.reorder_quantity = domain.reorderQuantity;
    entity.unit_cost = domain.unitCost;
    entity.status = domain.status;
    entity.notes = domain.notes;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}
