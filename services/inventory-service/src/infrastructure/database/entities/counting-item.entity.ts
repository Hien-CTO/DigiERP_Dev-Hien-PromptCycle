import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryCounting } from './inventory-counting.entity';

@Entity('counting_items')
export class CountingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  counting_id: number;

  @Column()
  product_id: number;

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 100 })
  product_sku: string;

  @Column({ nullable: true })
  area_id: number;

  @Column({ type: 'int' })
  expected_quantity: number;

  @Column({ type: 'int' })
  counted_quantity: number;

  @Column({ length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_cost: number;

  @Column({ type: 'int' })
  variance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  variance_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => InventoryCounting, (counting) => counting.items)
  @JoinColumn({ name: 'counting_id' })
  counting: InventoryCounting;
}
