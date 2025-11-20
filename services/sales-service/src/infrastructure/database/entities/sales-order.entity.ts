import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SalesOrderItem } from './sales-order-item.entity';

import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';

@Entity('sales_orders')
@Index(['order_number'], { unique: true })
@Index(['customer_id'])
@Index(['status'])
@Index(['created_at'])
export class SalesOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  order_number: string;

  @Column({ type: 'int' })
  customer_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customer_name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  customer_email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customer_phone: string;

  @Column({ type: 'int', nullable: true })
  warehouse_id: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shipping_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internal_notes: string;

  @Column({ type: 'date', nullable: true })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  required_date: Date;

  @Column({ type: 'date', nullable: true })
  shipped_date: Date;

  @Column({ type: 'date', nullable: true })
  delivered_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipping_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billing_address: string;

  @Column({ type: 'int', nullable: true })
  shipping_method_id: number;

  @Column({ type: 'int', nullable: true })
  payment_method_id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  tracking_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  // Relationships - Simplified to avoid circular dependencies
  @OneToMany(() => SalesOrderItem, item => item.order)
  items: SalesOrderItem[];
}
