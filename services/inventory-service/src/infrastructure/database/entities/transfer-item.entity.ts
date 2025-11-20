import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryTransfer } from './inventory-transfer.entity';

@Entity('transfer_items')
export class TransferItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transfer_id: number;

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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => InventoryTransfer, (transfer) => transfer.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer: InventoryTransfer;
}
