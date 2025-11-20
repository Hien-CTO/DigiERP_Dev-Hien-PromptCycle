import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Resource } from './resource.entity';
import { Action } from './action.entity';
import { RolePermission } from './role-permission.entity';
import { Tenant } from './tenant.entity';

@Entity('cat_permissions')
// Note: Unique constraint được handle bởi generated column tenant_id_for_unique trong database
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_name')
  name: string;

  @Column({ type: 'varchar', length: 150 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  @Index('idx_resource_action')
  resource_id: number;

  @Column({ type: 'bigint' })
  action_id: number;

  @Column({
    type: 'enum',
    enum: ['GLOBAL', 'TENANT'],
    default: 'GLOBAL',
  })
  @Index('idx_scope')
  scope: 'GLOBAL' | 'TENANT';

  @Column({ type: 'bigint', nullable: true })
  @Index('idx_tenant_id')
  tenant_id: number;

  @Column({ type: 'boolean', default: true })
  @Index('idx_is_active')
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Resource, (resource) => resource.permissions)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @ManyToOne(() => Action, (action) => action.permissions)
  @JoinColumn({ name: 'action_id' })
  action: Action;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
