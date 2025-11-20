import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrderItem as SalesOrderItemEntity } from '../entities/sales-order-item.entity';
import { SalesOrderItemRepository as ISalesOrderItemRepository } from '../../../domain/repositories/sales-order-item.repository.interface';
import { SalesOrderItem } from '../../../domain/entities/sales-order-item.entity';

@Injectable()
export class SalesOrderItemRepository implements ISalesOrderItemRepository {
  constructor(
    @InjectRepository(SalesOrderItemEntity)
    private readonly itemRepo: Repository<SalesOrderItemEntity>,
  ) {}

  async findById(id: number): Promise<SalesOrderItem | null> {
    const item = await this.itemRepo.findOne({ where: { id } });
    return item ? this.toDomain(item) : null;
  }

  async findByOrderId(orderId: number): Promise<SalesOrderItem[]> {
    const items = await this.itemRepo.find({ where: { order_id: orderId } });
    return items.map(item => this.toDomain(item));
  }

  async findByProductId(productId: number): Promise<SalesOrderItem[]> {
    const items = await this.itemRepo.find({ where: { product_id: productId } });
    return items.map(item => this.toDomain(item));
  }

  async save(item: SalesOrderItem): Promise<SalesOrderItem> {
    const itemEntity = this.toEntity(item);
    const savedItem = await this.itemRepo.save(itemEntity);
    return this.toDomain(savedItem);
  }

  async update(id: number, item: Partial<SalesOrderItem>): Promise<SalesOrderItem> {
    await this.itemRepo.update(id, this.toEntity(item as SalesOrderItem));
    const updatedItem = await this.itemRepo.findOne({ where: { id } });
    return this.toDomain(updatedItem);
  }

  async delete(id: number): Promise<void> {
    await this.itemRepo.delete(id);
  }

  async deleteByOrderId(orderId: number): Promise<void> {
    await this.itemRepo.delete({ order_id: orderId });
  }

  private toDomain(entity: SalesOrderItemEntity): SalesOrderItem {
    return new SalesOrderItem(
      entity.id,
      entity.order_id,
      entity.product_id,
      entity.product_sku,
      entity.product_name,
      entity.product_description,
      entity.quantity,
      entity.unit_price,
      entity.discount_amount,
      entity.discount_percentage,
      entity.line_total,
      entity.unit,
      entity.weight,
      entity.notes,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: SalesOrderItem): SalesOrderItemEntity {
    const entity = new SalesOrderItemEntity();
    entity.id = domain.id;
    entity.order_id = domain.orderId;
    entity.product_id = domain.productId;
    entity.product_sku = domain.productSku;
    entity.product_name = domain.productName;
    entity.product_description = domain.productDescription;
    entity.quantity = domain.quantity;
    entity.unit_price = domain.unitPrice;
    entity.discount_amount = domain.discountAmount;
    entity.discount_percentage = domain.discountPercentage;
    entity.line_total = domain.lineTotal;
    entity.unit = domain.unit;
    entity.weight = domain.weight;
    entity.notes = domain.notes;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}
