import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryTransferRepository } from '../../../domain/repositories/inventory-transfer.repository.interface';
import { InventoryTransfer } from '../../../domain/entities/inventory-transfer.entity';
import { InventoryTransfer as InventoryTransferEntity } from '../entities/inventory-transfer.entity';

@Injectable()
export class InventoryTransferRepository implements IInventoryTransferRepository {
  constructor(
    @InjectRepository(InventoryTransferEntity)
    private readonly repository: Repository<InventoryTransferEntity>,
  ) {}

  async create(inventoryTransfer: InventoryTransfer): Promise<InventoryTransfer> {
    const entity = this.repository.create(inventoryTransfer);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<InventoryTransfer | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<InventoryTransfer[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByFromWarehouseId(warehouseId: number): Promise<InventoryTransfer[]> {
    const entities = await this.repository.find({
      where: { from_warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByToWarehouseId(warehouseId: number): Promise<InventoryTransfer[]> {
    const entities = await this.repository.find({
      where: { to_warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InventoryTransfer[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByTransferRequestId(transferRequestId: number): Promise<InventoryTransfer[]> {
    const entities = await this.repository.find({
      where: { transfer_request_id: transferRequestId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, inventoryTransfer: Partial<InventoryTransfer>): Promise<InventoryTransfer> {
    await this.repository.update(id, inventoryTransfer);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateTransferNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `IT${year}${month}${sequence}`;
  }

  private toDomain(entity: InventoryTransferEntity): InventoryTransfer {
    return {
      id: entity.id,
      transferNumber: entity.transfer_number,
      transferRequestId: entity.transfer_request_id,
      fromWarehouseId: entity.from_warehouse_id,
      toWarehouseId: entity.to_warehouse_id,
      transferDate: entity.transfer_date,
      status: entity.status as any,
      transferredBy: entity.transferred_by,
      receivedBy: entity.received_by,
      reason: entity.reason,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        transferId: item.transfer_id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: Number(item.unit_cost),
        totalAmount: Number(item.total_amount),
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [],
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      createdBy: entity.created_by,
      updatedBy: entity.updated_by,
    };
  }
}
