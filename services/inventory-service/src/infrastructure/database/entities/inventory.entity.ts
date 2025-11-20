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

@Entity('inventory')
@Index(['product_id', 'warehouse_id'], { unique: true })
@Index(['product_id'])
@Index(['warehouse_id'])
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  warehouse_id: number;

  @Column({ type: 'int', nullable: true })
  area_id: number;

  @Column({ type: 'int', default: 0 })
  quantity_on_hand: number;

  @Column({ type: 'int', default: 0 })
  quantity_reserved: number;

  @Column({ type: 'int', default: 0 })
  quantity_available: number;

  @Column({ type: 'int', default: 0 })
  reorder_point: number;

  @Column({ type: 'int', default: 0 })
  reorder_quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ type: 'varchar', length: 20, default: 'IN_STOCK' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, default: 0 })
  quantity_virtual: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, default: 0 })
  quantity_on_loan_out: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, default: 0 })
  quantity_on_loan_in: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventories)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => Area, (area) => area.inventories)
  @JoinColumn({ name: 'area_id' })
  area: Area;
}
