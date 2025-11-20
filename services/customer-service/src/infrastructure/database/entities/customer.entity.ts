import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CustomerGroup } from './customer-group.entity';
import { Contract } from './contract.entity';
import { CustomerContact } from './customer-contact.entity';
import { PricingPolicy } from './pricing-policy.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'code' })
  code?: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'tax_code' })
  taxCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'contact_person' })
  contactPerson: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'payment_terms' })
  paymentTerms: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'credit_limit' })
  creditLimit: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'sales_rep' })
  salesRep: string; // Sales representative assigned to this customer

  @Column({ type: 'bigint', nullable: true, name: 'sales_representative_id' })
  salesRepresentativeId: number; // Foreign key to users table

  @Column({ type: 'uuid', nullable: true, name: 'customer_group_id' })
  customerGroupId: string;

  @ManyToOne(() => CustomerGroup, (group) => group.customers)
  @JoinColumn({ name: 'customer_group_id' })
  customerGroup: CustomerGroup;

  @OneToMany(() => Contract, (contract) => contract.customer)
  contracts: Contract[];

  @OneToMany(() => CustomerContact, (contact) => contact.customer)
  contacts: CustomerContact[];

  @OneToMany(() => PricingPolicy, (policy) => policy.customer)
  pricingPolicies: PricingPolicy[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
