import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryTransferRequest } from './inventory-transfer-request.entity';

@Entity('transfer_request_items')
export class TransferRequestItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transfer_request_id: number;

  @Column()
  product_id: number;

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 100 })
  product_sku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ length: 50 })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => InventoryTransferRequest, (transferRequest) => transferRequest.items)
  @JoinColumn({ name: 'transfer_request_id' })
  transferRequest: InventoryTransferRequest;
}
