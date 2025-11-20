import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { GoodsReceiptItem } from './goods-receipt-item.entity';

@Entity('goods_receipts')
export class GoodsReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  receipt_number: string;

  @Column({ nullable: true })
  purchase_order_id: number;

  @Column()
  warehouse_id: number;

  @Column({ type: 'date' })
  receipt_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING', 'RECEIVED', 'VERIFIED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255, nullable: true })
  received_by: string;

  @Column({ length: 255, nullable: true })
  verified_by: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  created_by: number;

  @Column()
  updated_by: number;

  @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt)
  items: GoodsReceiptItem[];
}
