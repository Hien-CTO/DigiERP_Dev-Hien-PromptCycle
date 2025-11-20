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

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: 'Số đơn nghỉ phép' })
  @Index('idx_request_number')
  request_number: string;

  @Column({ type: 'int', comment: 'FK to employees.id' })
  @Index('idx_employee_id')
  employee_id: number;

  @Column({ type: 'int', comment: 'FK to cat_leave_types.id' })
  @Index('idx_leave_type_id')
  leave_type_id: number;

  // Thời gian nghỉ
  @Column({ type: 'date', comment: 'Ngày bắt đầu' })
  @Index('idx_start_date')
  start_date: Date;

  @Column({ type: 'date', comment: 'Ngày kết thúc' })
  @Index('idx_end_date')
  end_date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Tổng số ngày nghỉ' })
  total_days: number;

  @Column({ type: 'boolean', default: false, comment: 'Nghỉ nửa ngày' })
  is_half_day: boolean;

  @Column({
    type: 'enum',
    enum: ['MORNING', 'AFTERNOON'],
    nullable: true,
    comment: 'Nửa ngày sáng hay chiều',
  })
  half_day_type: string;

  // Lý do
  @Column({ type: 'text' })
  reason: string;

  // Phê duyệt
  @Column({ type: 'int', nullable: true, comment: 'FK to employees.id - Người duyệt' })
  @Index('idx_approver_id')
  approver_id: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
  })
  @Index('idx_status')
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  // File đính kèm
  @Column({ type: 'text', nullable: true })
  attachment_url: string;

  // Ghi chú
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Audit
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  // Relations
  @ManyToOne(() => Employee, (emp) => emp.leaveRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: Employee;

  @ManyToOne(() => CatLeaveTypes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: CatLeaveTypes;
}

