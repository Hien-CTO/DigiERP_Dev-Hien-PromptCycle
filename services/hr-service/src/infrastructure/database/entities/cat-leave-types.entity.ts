import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cat_leave_types')
export class CatLeaveTypes {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index('idx_code')
  code: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_name')
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_paid: boolean;

  @Column({ type: 'int', nullable: true })
  max_days_per_year: number;

  @Column({ type: 'boolean', default: true })
  requires_approval: boolean;

  @Column({ type: 'boolean', default: true })
  @Index('idx_is_active')
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;
}

