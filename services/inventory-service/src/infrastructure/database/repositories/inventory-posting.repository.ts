import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryPostingRepository } from '../../../domain/repositories/inventory-posting.repository.interface';
import { InventoryPosting } from '../../../domain/entities/inventory-posting.entity';
import { InventoryPosting as InventoryPostingEntity } from '../entities/inventory-posting.entity';

@Injectable()
export class InventoryPostingRepository implements IInventoryPostingRepository {
  constructor(
    @InjectRepository(InventoryPostingEntity)
    private readonly repository: Repository<InventoryPostingEntity>,
  ) {}

  async create(inventoryPosting: InventoryPosting): Promise<InventoryPosting> {
    const entity = this.repository.create(inventoryPosting);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<InventoryPosting | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<InventoryPosting[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByWarehouseId(warehouseId: number): Promise<InventoryPosting[]> {
    const entities = await this.repository.find({
      where: { warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InventoryPosting[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, inventoryPosting: Partial<InventoryPosting>): Promise<InventoryPosting> {
    await this.repository.update(id, inventoryPosting);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generatePostingNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `IP${year}${month}${sequence}`;
  }

  private toDomain(entity: InventoryPostingEntity): InventoryPosting {
    return {
      id: entity.id,
      postingNumber: entity.posting_number,
      countingId: entity.counting_id,
      warehouseId: entity.warehouse_id,
      postingDate: entity.posting_date,
      status: entity.status as any,
      postedBy: entity.posted_by,
      reason: entity.reason,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        postingId: item.posting_id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        areaId: item.area_id,
        quantityBefore: item.quantity_before,
        quantityAfter: item.quantity_after,
        unit: item.unit,
        unitCost: Number(item.unit_cost),
        adjustmentAmount: Number(item.adjustment_amount),
        reason: item.reason,
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
