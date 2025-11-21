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
  @Column({ type: 'int', nullable: true, comment: 'FK to employees.id - Manager phê duyệt' })
  @Index('idx_approver_id')
  approver_id: number;

  @Column({ type: 'int', nullable: true, comment: 'FK to employees.id - HR Manager phê duyệt' })
  @Index('idx_hr_approver_id')
  hr_approver_id: number;

  @Column({ type: 'boolean', default: false, comment: 'Yêu cầu phê duyệt từ HR Manager' })
  @Index('idx_requires_hr_approval')
  requires_hr_approval: boolean;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
  })
  @Index('idx_status')
  status: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'Deprecated, dùng manager_approved_at/hr_approved_at' })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true, comment: 'Deprecated, dùng manager_rejection_reason/hr_rejection_reason' })
  rejection_reason: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian Manager phê duyệt' })
  manager_approved_at: Date;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian HR Manager phê duyệt' })
  hr_approved_at: Date;

  @Column({ type: 'text', nullable: true, comment: 'Lý do Manager từ chối' })
  manager_rejection_reason: string;

  @Column({ type: 'text', nullable: true, comment: 'Lý do HR Manager từ chối' })
  hr_rejection_reason: string;

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú từ Manager' })
  manager_notes: string;

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú từ HR Manager' })
  hr_notes: string;

  // File đính kèm
  @Column({ type: 'text', nullable: true })
  attachment_url: string;

  // Ghi chú
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Edit tracking
  @Column({ type: 'boolean', default: false, comment: 'Đã được chỉnh sửa' })
  @Index('idx_is_edited')
  is_edited: boolean;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian chỉnh sửa' })
  edited_at: Date;

  @Column({ type: 'int', nullable: true, comment: 'FK to users.id - Người chỉnh sửa' })
  @Index('idx_edited_by')
  edited_by: number;

  @Column({ type: 'text', nullable: true, comment: 'Lý do chỉnh sửa' })
  edit_reason: string;

  // Cancellation
  @Column({ type: 'text', nullable: true, comment: 'Lý do hủy' })
  cancellation_reason: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian hủy' })
  cancelled_at: Date;

  @Column({ type: 'int', nullable: true, comment: 'FK to users.id - Người hủy' })
  cancelled_by: number;

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

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'hr_approver_id' })
  hrApprover: Employee;

  @ManyToOne(() => CatLeaveTypes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: CatLeaveTypes;
}

