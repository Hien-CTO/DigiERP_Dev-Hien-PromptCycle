import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { PricingPolicy } from './pricing-policy.entity';

@Entity('pricing_policy_details')
@Index(['pricing_policy_id'])
@Index(['product_id'])
@Unique(['pricing_policy_id', 'product_id'])
export class PricingPolicyDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'pricing_policy_id' })
  pricing_policy_id: number;

  @Column({ type: 'int', name: 'product_id' })
  product_id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'base_price' })
  base_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'discount_percentage' })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'discounted_price' })
  discounted_price: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  created_by: number | null;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updated_by: number | null;

  // Relationships
  @ManyToOne(() => PricingPolicy, (policy) => policy.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pricing_policy_id' })
  pricingPolicy: PricingPolicy;
}


