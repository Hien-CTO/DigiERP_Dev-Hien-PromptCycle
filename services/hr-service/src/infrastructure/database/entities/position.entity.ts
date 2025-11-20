import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('positions')
export class Position {
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

  @Column({ type: 'int', default: 1, comment: 'Cấp bậc: 1=Junior, 2=Middle, 3=Senior, 4=Lead, 5=Manager' })
  @Index('idx_level')
  level: number;

  @Column({ type: 'text', nullable: true, comment: 'Yêu cầu công việc' })
  requirements: string;

  @Column({ type: 'boolean', default: true })
  @Index('idx_is_active')
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;
}

