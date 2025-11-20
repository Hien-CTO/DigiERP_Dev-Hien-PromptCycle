import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserTenant } from './user-tenant.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index('idx_code')
  code: string;

  @Column({ type: 'varchar', length: 200 })
  @Index('idx_name')
  name: string;

  @Column({ type: 'varchar', length: 200 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @Index('idx_tax_code')
  tax_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'bigint', nullable: true })
  city_id: number;

  @Column({ type: 'bigint', nullable: true })
  province_id: number;

  @Column({ type: 'bigint', nullable: true })
  country_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
    default: 'ACTIVE',
  })
  @Index('idx_status')
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

  @Column({
    type: 'enum',
    enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
    default: 'BASIC',
  })
  @Index('idx_subscription_tier')
  subscription_tier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

  @Column({ type: 'timestamp', nullable: true })
  subscription_expires_at: Date;

  @Column({ type: 'int', default: 10 })
  max_users: number;

  @Column({ type: 'int', default: 10 })
  max_storage_gb: number;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  @Index('idx_is_active')
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  @Index('idx_created_at')
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'bigint', nullable: true })
  created_by: number;

  @Column({ type: 'bigint', nullable: true })
  updated_by: number;

  // Relations
  @OneToMany(() => UserTenant, (userTenant) => userTenant.tenant)
  userTenants: UserTenant[];
}

