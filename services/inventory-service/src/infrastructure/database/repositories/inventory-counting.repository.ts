import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryCountingRepository } from '../../../domain/repositories/inventory-counting.repository.interface';
import { InventoryCounting } from '../../../domain/entities/inventory-counting.entity';
import { InventoryCounting as InventoryCountingEntity } from '../entities/inventory-counting.entity';

@Injectable()
export class InventoryCountingRepository implements IInventoryCountingRepository {
  constructor(
    @InjectRepository(InventoryCountingEntity)
    private readonly repository: Repository<InventoryCountingEntity>,
  ) {}

  async create(inventoryCounting: InventoryCounting): Promise<InventoryCounting> {
    const entity = this.repository.create(inventoryCounting);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<InventoryCounting | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<InventoryCounting[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByWarehouseId(warehouseId: number): Promise<InventoryCounting[]> {
    const entities = await this.repository.find({
      where: { warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InventoryCounting[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, inventoryCounting: Partial<InventoryCounting>): Promise<InventoryCounting> {
    await this.repository.update(id, inventoryCounting);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateCountingNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `IC${year}${month}${sequence}`;
  }

  private toDomain(entity: InventoryCountingEntity): InventoryCounting {
    return {
      id: entity.id,
      countingNumber: entity.counting_number,
      warehouseId: entity.warehouse_id,
      countingDate: entity.counting_date,
      status: entity.status as any,
      countedBy: entity.counted_by,
      reviewedBy: entity.reviewed_by,
      reason: entity.reason,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        countingId: item.counting_id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        areaId: item.area_id,
        expectedQuantity: item.expected_quantity,
        countedQuantity: item.counted_quantity,
        unit: item.unit,
        unitCost: Number(item.unit_cost),
        variance: item.variance,
        varianceAmount: Number(item.variance_amount),
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
