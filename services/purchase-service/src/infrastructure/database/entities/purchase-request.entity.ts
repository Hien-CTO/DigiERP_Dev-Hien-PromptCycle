import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseRequestItem } from './purchase-request-item.entity';

export enum PurchaseRequestStatusEnum {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  request_number: string;

  @Column({ type: 'varchar', length: 36 })
  warehouse_id: string;

  @Column({
    type: 'enum',
    enum: PurchaseRequestStatusEnum,
    default: PurchaseRequestStatusEnum.DRAFT,
  })
  status: PurchaseRequestStatusEnum;

  @Column({ type: 'date' })
  request_date: Date;

  @Column({ type: 'date', nullable: true })
  required_date: Date;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 36 })
  requested_by: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  approved_by: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  rejected_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PurchaseRequestItem, (item) => item.purchase_request, {
    cascade: true,
    eager: true,
  })
  items: PurchaseRequestItem[];
}

