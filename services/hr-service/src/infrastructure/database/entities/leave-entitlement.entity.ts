import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';
import { CatLeaveTypes } from './cat-leave-types.entity';

@Entity('leave_entitlements')
export class LeaveEntitlement {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: 'FK to employees.id' })
  @Index('idx_employee_id')
  employee_id: number;

  @Column({ type: 'int', comment: 'FK to cat_leave_types.id' })
  @Index('idx_leave_type_id')
  leave_type_id: number;

  @Column({ type: 'int', comment: 'Năm (YYYY)' })
  @Index('idx_year')
  year: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày được cấp phát',
  })
  entitlement_days: number;

  @Column({ type: 'date', comment: 'Ngày được cấp phát' })
  @Index('idx_granted_date')
  granted_date: Date;

  @Column({ type: 'date', nullable: true, comment: 'Ngày hết hạn (nếu có)' })
  expiration_date: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày được carry-over từ năm trước',
  })
  carry_over_days: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Cơ sở tính toán: CONTRACT_TYPE, TENURE, POSITION, etc.',
  })
  calculation_basis: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Chi tiết tính toán (JSON hoặc text)',
  })
  calculation_details: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Có phải prorated (nhân viên mới vào giữa năm)',
  })
  is_prorated: boolean;

  @Column({ type: 'date', nullable: true, comment: 'Ngày bắt đầu tính prorated' })
  prorated_from_date: Date;

  @Column({ type: 'date', nullable: true, comment: 'Ngày kết thúc tính prorated' })
  prorated_to_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  // Relations
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => CatLeaveTypes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: CatLeaveTypes;
}

