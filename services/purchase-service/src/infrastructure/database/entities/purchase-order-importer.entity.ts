import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_order_importers')
export class PurchaseOrderImporter {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36 })
  purchase_order_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  importer_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  importer_phone: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  importer_fax: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  importer_email: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.importer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchase_order: PurchaseOrder;
}

