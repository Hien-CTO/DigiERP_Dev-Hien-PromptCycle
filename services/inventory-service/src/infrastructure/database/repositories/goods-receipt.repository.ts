import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGoodsReceiptRepository } from '../../../domain/repositories/goods-receipt.repository.interface';
import { GoodsReceipt } from '../../../domain/entities/goods-receipt.entity';
import { GoodsReceipt as GoodsReceiptEntity } from '../entities/goods-receipt.entity';

@Injectable()
export class GoodsReceiptRepository implements IGoodsReceiptRepository {
  constructor(
    @InjectRepository(GoodsReceiptEntity)
    private readonly repository: Repository<GoodsReceiptEntity>,
  ) {}

  async create(goodsReceipt: GoodsReceipt): Promise<GoodsReceipt> {
    const entity = this.repository.create(goodsReceipt);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<GoodsReceipt | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<GoodsReceipt[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByWarehouseId(warehouseId: number): Promise<GoodsReceipt[]> {
    const entities = await this.repository.find({
      where: { warehouse_id: warehouseId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: string): Promise<GoodsReceipt[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByPurchaseOrderId(purchaseOrderId: number): Promise<GoodsReceipt[]> {
    const entities = await this.repository.find({
      where: { purchase_order_id: purchaseOrderId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(id: number, goodsReceipt: Partial<GoodsReceipt>): Promise<GoodsReceipt> {
    await this.repository.update(id, goodsReceipt);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return this.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateReceiptNumber(): Promise<string> {
    const count = await this.repository.count();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');
    return `GR${year}${month}${sequence}`;
  }

  private toDomain(entity: GoodsReceiptEntity): GoodsReceipt {
    return {
      id: entity.id,
      receiptNumber: entity.receipt_number,
      purchaseOrderId: entity.purchase_order_id,
      warehouseId: entity.warehouse_id,
      receiptDate: entity.receipt_date,
      status: entity.status as any,
      receivedBy: entity.received_by,
      verifiedBy: entity.verified_by,
      notes: entity.notes,
      items: entity.items?.map(item => ({
        id: item.id,
        goodsReceiptId: item.goods_receipt_id,
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
