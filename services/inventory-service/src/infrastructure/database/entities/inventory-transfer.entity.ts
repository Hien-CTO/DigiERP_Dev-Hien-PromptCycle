import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TransferItem } from './transfer-item.entity';

@Entity('inventory_transfers')
export class InventoryTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  transfer_number: string;

  @Column({ nullable: true })
  transfer_request_id: number;

  @Column()
  from_warehouse_id: number;

  @Column()
  to_warehouse_id: number;

  @Column({ type: 'date' })
  transfer_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255 })
  transferred_by: string;

  @Column({ length: 255, nullable: true })
  received_by: string;

  @Column({ length: 500 })
  reason: string;

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

  @OneToMany(() => TransferItem, (item) => item.transfer)
  items: TransferItem[];
}
