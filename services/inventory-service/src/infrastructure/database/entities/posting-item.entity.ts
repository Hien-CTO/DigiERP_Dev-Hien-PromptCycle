import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryPosting } from './inventory-posting.entity';

@Entity('posting_items')
export class PostingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  posting_id: number;

  @Column()
  product_id: number;

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 100 })
  product_sku: string;

  @Column({ nullable: true })
  area_id: number;

  @Column({ type: 'int' })
  quantity_before: number;

  @Column({ type: 'int' })
  quantity_after: number;

  @Column({ length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  adjustment_amount: number;

  @Column({ length: 500 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => InventoryPosting, (posting) => posting.items)
  @JoinColumn({ name: 'posting_id' })
  posting: InventoryPosting;
}
