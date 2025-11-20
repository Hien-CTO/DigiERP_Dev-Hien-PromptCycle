import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryRevaluation } from './inventory-revaluation.entity';

@Entity('revaluation_items')
export class RevaluationItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  revaluation_id: number;

  @Column()
  product_id: number;

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 100 })
  product_sku: string;

  @Column({ nullable: true })
  area_id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  old_unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  new_unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  revaluation_amount: number;

  @Column({ length: 500 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => InventoryRevaluation, (revaluation) => revaluation.items)
  @JoinColumn({ name: 'revaluation_id' })
  revaluation: InventoryRevaluation;
}
