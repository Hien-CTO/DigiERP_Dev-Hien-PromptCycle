import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGoodsIssueRepository } from '../../../domain/repositories/goods-issue.repository.interface';
import { GoodsIssue } from '../../../domain/entities/goods-issue.entity';
import { GoodsIssue as GoodsIssueEntity } from '../entities/goods-issue.entity';

@Injectable()
export class GoodsIssueRepository implements IGoodsIssueRepository {
  constructor(
    @InjectRepository(GoodsIssueEntity)
    private readonly repository: Repository<GoodsIssueEntity>,
  ) {}

  async create(goodsIssue: GoodsIssue): Promise<GoodsIssue> {
    const entity = this.repository.create(goodsIssue);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<GoodsIssue | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<GoodsIssue[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByWarehouseId(warehouseId: number): Promise<GoodsIssue[]> {
    const entities = await this.repository.find({
      where: { warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<GoodsIssue[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findBySalesOrderId(salesOrderId: number): Promise<GoodsIssue[]> {
    const entities = await this.repository.find({
      where: { sales_order_id: salesOrderId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, goodsIssue: Partial<GoodsIssue>): Promise<GoodsIssue> {
    await this.repository.update(id, goodsIssue);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateIssueNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `GI${year}${month}${sequence}`;
  }

  private toDomain(entity: GoodsIssueEntity): GoodsIssue {
    return {
      id: entity.id,
      issueNumber: entity.issue_number,
      salesOrderId: entity.sales_order_id,
      warehouseId: entity.warehouse_id,
      issueDate: entity.issue_date,
      status: entity.status as any,
      issuedBy: entity.issued_by,
      verifiedBy: entity.verified_by,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        goodsIssueId: item.goods_issue_id,
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
