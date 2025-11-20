import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('cat_invoice_status')
@Index(['code'], { unique: true })
@Index(['name'])
@Index(['is_active'])
export class InvoiceStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_final: boolean;

  @Column({ type: 'boolean', default: false })
  allows_payment: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  // Relationships
  @OneToMany(() => Invoice, (invoice) => invoice.invoiceStatus)
  invoices: Invoice[];
}
