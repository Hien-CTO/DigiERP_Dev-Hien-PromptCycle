import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AttendanceRecord } from './attendance-record.entity';

@Entity('attendance_edit_history')
export class AttendanceEditHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: 'FK to attendance_records.id' })
  @Index('idx_attendance_record_id')
  attendance_record_id: number;

  @Column({ type: 'varchar', length: 100, comment: 'Tên field được thay đổi' })
  field_name: string;

  @Column({ type: 'text', nullable: true, comment: 'Giá trị cũ' })
  old_value: string;

  @Column({ type: 'text', nullable: true, comment: 'Giá trị mới' })
  new_value: string;

  @Column({ type: 'text', nullable: true, comment: 'Lý do chỉnh sửa' })
  edit_reason: string;

  @Column({ type: 'int', nullable: true, comment: 'FK to users.id' })
  @Index('idx_edited_by')
  edited_by: number;

  @CreateDateColumn({ type: 'timestamp', comment: 'Thời gian chỉnh sửa' })
  @Index('idx_edited_at')
  edited_at: Date;

  // Relations
  @ManyToOne(() => AttendanceRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendance_record_id' })
  attendanceRecord: AttendanceRecord;
}

