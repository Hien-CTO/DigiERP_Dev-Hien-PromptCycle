import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryRevaluationRepository } from '../../../domain/repositories/inventory-revaluation.repository.interface';
import { InventoryRevaluation } from '../../../domain/entities/inventory-revaluation.entity';
import { InventoryRevaluation as InventoryRevaluationEntity } from '../entities/inventory-revaluation.entity';

@Injectable()
export class InventoryRevaluationRepository implements IInventoryRevaluationRepository {
  constructor(
    @InjectRepository(InventoryRevaluationEntity)
    private readonly repository: Repository<InventoryRevaluationEntity>,
  ) {}

  async create(inventoryRevaluation: InventoryRevaluation): Promise<InventoryRevaluation> {
    const entity = this.repository.create(inventoryRevaluation);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<InventoryRevaluation | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<InventoryRevaluation[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByWarehouseId(warehouseId: number): Promise<InventoryRevaluation[]> {
    const entities = await this.repository.find({
      where: { warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InventoryRevaluation[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, inventoryRevaluation: Partial<InventoryRevaluation>): Promise<InventoryRevaluation> {
    await this.repository.update(id, inventoryRevaluation);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateRevaluationNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `IR${year}${month}${sequence}`;
  }

  private toDomain(entity: InventoryRevaluationEntity): InventoryRevaluation {
    return {
      id: entity.id,
      revaluationNumber: entity.revaluation_number,
      warehouseId: entity.warehouse_id,
      revaluationDate: entity.revaluation_date,
      status: entity.status as any,
      revaluedBy: entity.revalued_by,
      reason: entity.reason,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        revaluationId: item.revaluation_id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        areaId: item.area_id,
        quantity: item.quantity,
        unit: item.unit,
        oldUnitCost: Number(item.old_unit_cost),
        newUnitCost: Number(item.new_unit_cost),
        revaluationAmount: Number(item.revaluation_amount),
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
