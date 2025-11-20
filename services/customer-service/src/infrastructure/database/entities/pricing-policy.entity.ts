import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { PricingPolicyDetail } from './pricing-policy-detail.entity';

export enum PricingPolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity('pricing_policies')
@Index(['customer_id'])
@Index(['status'])
@Index(['valid_from'])
@Index(['valid_to'])
export class PricingPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 36, name: 'customer_id' })
  customer_id: string;

  @Column({ type: 'datetime', name: 'valid_from' })
  valid_from: Date;

  @Column({ type: 'datetime', nullable: true, name: 'valid_to' })
  valid_to: Date | null;

  @Column({
    type: 'enum',
    enum: PricingPolicyStatus,
    default: PricingPolicyStatus.ACTIVE,
  })
  status: PricingPolicyStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  created_by: number | null;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updated_by: number | null;

  // Relationships
  @ManyToOne(() => Customer, (customer) => customer.pricingPolicies)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => PricingPolicyDetail, (detail) => detail.pricingPolicy)
  details: PricingPolicyDetail[];
}


