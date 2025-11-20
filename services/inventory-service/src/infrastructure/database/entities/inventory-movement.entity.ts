import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum ReferenceType {
  PURCHASE = 'PURCHASE',
  SALES = 'SALES',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

@Entity('inventory_movements')
@Index(['product_id', 'warehouse_id'])
@Index(['movement_type'])
@Index(['reference_type'])
@Index(['created_at'])
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  warehouse_id: number;

  @Column({ 
    type: 'enum', 
    enum: MovementType 
  })
  movement_type: MovementType;

  @Column({ 
    type: 'enum', 
    enum: ReferenceType 
  })
  reference_type: ReferenceType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  total_cost: number;

  @Column({ type: 'int' })
  quantity_before: number;

  @Column({ type: 'int' })
  quantity_after: number;

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
}
