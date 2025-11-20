import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';
import { Role } from './role.entity';

@Entity('user_tenants')
@Unique(['user_id', 'tenant_id', 'role_id'])
export class UserTenant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  @Index('idx_user_id')
  user_id: number;

  @Column({ type: 'bigint' })
  @Index('idx_tenant_id')
  tenant_id: number;

  @Column({ type: 'int' })
  @Index('idx_role_id')
  role_id: number;

  @Column({ type: 'boolean', default: false })
  @Index('idx_is_primary')
  is_primary: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index('idx_joined_at')
  joined_at: Date;

  @Column({ type: 'int', nullable: true })
  invited_by: number;

  @Column({ type: 'boolean', default: true })
  @Index('idx_is_active')
  is_active: boolean;

  // Relations
  @ManyToOne(() => User, (user) => user.userTenants)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tenant, (tenant) => tenant.userTenants)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}

