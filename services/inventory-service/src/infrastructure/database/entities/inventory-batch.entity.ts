import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Area } from './area.entity';

@Entity('inventory_batches')
@Index(['product_id', 'warehouse_id'])
@Index(['batch_number'])
@Index(['expiry_date'])
@Index(['receipt_date'])
export class InventoryBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  warehouse_id: number;

  @Column({ type: 'int', nullable: true })
  area_id: number;

  @Column({ type: 'varchar', length: 100 })
  batch_number: string;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'date' })
  receipt_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, default: 0 })
  unit_cost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location_code: string;

  @Column({ type: 'text', nullable: true })
  location_description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'tinyint', default: 1 })
  is_active: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'area_id' })
  area: Area;
}



