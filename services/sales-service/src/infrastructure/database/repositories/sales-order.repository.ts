import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder as SalesOrderEntity } from '../entities/sales-order.entity';
import { SalesOrderRepository as ISalesOrderRepository } from '../../../domain/repositories/sales-order.repository.interface';
import { SalesOrder } from '../../../domain/entities/sales-order.entity';

@Injectable()
export class SalesOrderRepository implements ISalesOrderRepository {
  constructor(
    @InjectRepository(SalesOrderEntity)
    private readonly orderRepo: Repository<SalesOrderEntity>,
  ) {}

  async findById(id: number): Promise<SalesOrder | null> {
    const order = await this.orderRepo.findOne({ where: { id } });
    return order ? this.toDomain(order) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<SalesOrder | null> {
    const order = await this.orderRepo.findOne({ where: { order_number: orderNumber } });
    return order ? this.toDomain(order) : null;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ orders: SalesOrder[]; total: number }> {
    const queryBuilder = this.orderRepo.createQueryBuilder('order');

    if (search) {
      queryBuilder.where(
        'order.order_number LIKE :search OR order.customer_name LIKE :search OR order.customer_email LIKE :search',
        { search: `%${search}%` }
      );
    }

    const [orders, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.created_at', 'DESC')
      .getManyAndCount();

    return {
      orders: orders.map(order => this.toDomain(order)),
      total,
    };
  }

  async findByCustomerId(customerId: number): Promise<SalesOrder[]> {
    const orders = await this.orderRepo.find({ where: { customer_id: customerId } });
    return orders.map(order => this.toDomain(order));
  }

  async findByStatus(status: string): Promise<SalesOrder[]> {
    const orders = await this.orderRepo.find({ where: { status: status as any } });
    return orders.map(order => this.toDomain(order));
  }

  async save(order: SalesOrder): Promise<SalesOrder> {
    const orderEntity = this.toEntity(order);
    const savedOrder = await this.orderRepo.save(orderEntity);
    return this.toDomain(savedOrder);
  }

  async update(id: number, order: Partial<SalesOrder>): Promise<SalesOrder> {
    await this.orderRepo.update(id, this.toEntity(order as SalesOrder));
    const updatedOrder = await this.orderRepo.findOne({ where: { id } });
    return this.toDomain(updatedOrder);
  }

  async delete(id: number): Promise<void> {
    await this.orderRepo.delete(id);
  }

  private toDomain(entity: SalesOrderEntity): SalesOrder {
    return new SalesOrder(
      entity.id,
      entity.order_number,
      entity.customer_id,
      entity.customer_name,
      entity.customer_email,
      entity.customer_phone,
      entity.warehouse_id,
      entity.status,
      entity.payment_status,
      entity.subtotal,
      entity.tax_amount,
      entity.discount_amount,
      entity.shipping_amount,
      entity.total_amount,
      entity.currency,
      entity.notes,
      entity.internal_notes,
      entity.order_date,
      entity.required_date,
      entity.shipped_date,
      entity.delivered_date,
      entity.shipping_address,
      entity.billing_address,
      entity.shipping_method_id?.toString(),
      entity.payment_method_id?.toString(),
      entity.tracking_number,
      entity.created_at,
      entity.updated_at,
      entity.created_by,
      entity.updated_by,
    );
  }

  private toEntity(domain: SalesOrder): SalesOrderEntity {
    const entity = new SalesOrderEntity();
    entity.id = domain.id;
    entity.order_number = domain.orderNumber;
    entity.customer_id = domain.customerId;
    entity.customer_name = domain.customerName;
    entity.customer_email = domain.customerEmail;
    entity.customer_phone = domain.customerPhone;
    entity.warehouse_id = domain.warehouseId;
    entity.status = domain.status;
    entity.payment_status = domain.paymentStatus;
    entity.subtotal = domain.subtotal;
    entity.tax_amount = domain.taxAmount;
    entity.discount_amount = domain.discountAmount;
    entity.shipping_amount = domain.shippingAmount;
    entity.total_amount = domain.totalAmount;
    entity.currency = domain.currency;
    entity.notes = domain.notes;
    entity.internal_notes = domain.internalNotes;
    entity.order_date = domain.orderDate;
    entity.required_date = domain.requiredDate;
    entity.shipped_date = domain.shippedDate;
    entity.delivered_date = domain.deliveredDate;
    entity.shipping_address = domain.shippingAddress;
    entity.billing_address = domain.billingAddress;
    entity.shipping_method_id = parseInt(domain.shippingMethod);
    entity.payment_method_id = parseInt(domain.paymentMethod);
    entity.tracking_number = domain.trackingNumber;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.created_by = domain.createdBy;
    entity.updated_by = domain.updatedBy;
    return entity;
  }
}
