import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_contacts')
export class CustomerContact {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 36, name: 'customer_id' })
  customerId: string; // UUID của customer

  @Column({ type: 'varchar', length: 100 })
  title: string; // Kế Toán, Nhận Hàng, Bộ phận kho, ...

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact_person' })
  contactPerson?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string; // Phòng ban

  @Column({ type: 'varchar', length: 100, nullable: true })
  position?: string; // Chức vụ

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false, name: 'is_primary' })
  isPrimary: boolean; // Liên hệ chính

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ManyToOne(() => Customer, (customer) => customer.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'bigint', nullable: true, name: 'created_by' })
  createdBy?: number;

  @Column({ type: 'bigint', nullable: true, name: 'updated_by' })
  updatedBy?: number;
}

