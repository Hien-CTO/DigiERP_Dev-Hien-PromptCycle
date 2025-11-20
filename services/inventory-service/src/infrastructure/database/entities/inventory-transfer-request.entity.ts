import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TransferRequestItem } from './transfer-request-item.entity';

@Entity('inventory_transfer_requests')
export class InventoryTransferRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  request_number: string;

  @Column()
  from_warehouse_id: number;

  @Column()
  to_warehouse_id: number;

  @Column({ type: 'date' })
  request_date: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ length: 255 })
  requested_by: string;

  @Column({ length: 255, nullable: true })
  approved_by: string;

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

  @OneToMany(() => TransferRequestItem, (item) => item.transferRequest)
  items: TransferRequestItem[];
}
