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
import { Employee } from './employee.entity';
import { CatLeaveTypes } from './cat-leave-types.entity';

@Entity('leave_balances')
@Unique(['employee_id', 'leave_type_id', 'year'])
export class LeaveBalance {
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
    comment: 'Số ngày được cấp phát (tổng entitlement)',
  })
  entitlement_days: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày đã sử dụng',
  })
  used_days: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày còn lại (tự động tính)',
  })
  remaining_days: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày carry-over từ năm trước',
  })
  carry_over_days: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày đã hết hạn (không được carry-over)',
  })
  expired_days: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Số ngày đang pending (chưa được approve)',
  })
  pending_days: number;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian tính toán cuối cùng' })
  last_calculated_at: Date;

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

