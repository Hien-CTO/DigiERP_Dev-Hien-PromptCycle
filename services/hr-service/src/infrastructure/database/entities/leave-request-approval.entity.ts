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
import { LeaveRequest } from './leave-request.entity';
import { Employee } from './employee.entity';

@Entity('leave_request_approvals')
export class LeaveRequestApproval {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: 'FK to leave_requests.id' })
  @Index('idx_leave_request_id')
  leave_request_id: number;

  @Column({
    type: 'enum',
    enum: ['MANAGER', 'HR_MANAGER'],
    comment: 'Cấp độ phê duyệt',
  })
  @Index('idx_approval_level')
  approval_level: string;

  @Column({ type: 'int', comment: 'FK to employees.id - Người phê duyệt' })
  @Index('idx_approver_id')
  approver_id: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    comment: 'Trạng thái phê duyệt',
  })
  @Index('idx_status')
  status: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian phê duyệt' })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian từ chối' })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true, comment: 'Lý do từ chối' })
  rejection_reason: string;

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú' })
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
  @ManyToOne(() => LeaveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;

  @ManyToOne(() => Employee, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'approver_id' })
  approver: Employee;
}

