import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LeaveRequest } from './leave-request.entity';

@Entity('leave_request_edit_history')
export class LeaveRequestEditHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: 'FK to leave_requests.id' })
  @Index('idx_leave_request_id')
  leave_request_id: number;

  @Column({ type: 'int', comment: 'FK to users.id - Người chỉnh sửa' })
  @Index('idx_edited_by')
  edited_by: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: 'Thời gian chỉnh sửa' })
  @Index('idx_edited_at')
  edited_at: Date;

  @Column({ type: 'text', nullable: true, comment: 'Lý do chỉnh sửa' })
  edit_reason: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Giá trị cũ (JSON format)',
  })
  old_values: any;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Giá trị mới (JSON format)',
  })
  new_values: any;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Danh sách các trường đã thay đổi',
  })
  changed_fields: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Relations
  @ManyToOne(() => LeaveRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;
}

