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
import { CatAttendanceTypes } from './cat-attendance-types.entity';

@Entity('attendance_records')
@Unique(['employee_id', 'attendance_date'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: 'FK to employees.id' })
  @Index('idx_employee_id')
  employee_id: number;

  @Column({ type: 'date', comment: 'Ngày chấm công' })
  @Index('idx_attendance_date')
  attendance_date: Date;

  @Column({ type: 'int', nullable: true, comment: 'FK to cat_attendance_types.id' })
  attendance_type_id: number;

  // Giờ chấm công
  @Column({ type: 'datetime', comment: 'Thời gian check-in' })
  check_in_time: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Thời gian check-out' })
  check_out_time: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.0, comment: 'Thời gian nghỉ (giờ)' })
  break_time: number;

  // Tính toán
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Số giờ làm việc' })
  working_hours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'Số giờ làm thêm' })
  overtime_hours: number;

  @Column({ type: 'boolean', default: false, comment: 'Có đi muộn không' })
  @Index('idx_late')
  late: boolean;

  @Column({ type: 'int', default: 0, comment: 'Số phút đi muộn' })
  late_minutes: number;

  @Column({ type: 'text', nullable: true, comment: 'Lý do đi muộn' })
  late_reason: string;

  @Column({ type: 'boolean', default: false, comment: 'Có về sớm không' })
  @Index('idx_early_leave')
  early_leave: boolean;

  @Column({ type: 'int', default: 0, comment: 'Số phút về sớm' })
  early_leave_minutes: number;

  @Column({ type: 'text', nullable: true, comment: 'Lý do về sớm' })
  early_leave_reason: string;

  // Loại chấm công
  @Column({
    type: 'enum',
    enum: ['NORMAL', 'OVERTIME', 'HOLIDAY', 'WEEKEND'],
    default: 'NORMAL',
    comment: 'Loại chấm công',
  })
  @Index('idx_type')
  type: string;

  // Trạng thái chấm công
  @Column({
    type: 'enum',
    enum: ['CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
    default: 'CHECKED_IN',
    comment: 'Trạng thái chấm công',
  })
  @Index('idx_status')
  status: string;

  // Trạng thái phê duyệt
  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    comment: 'Trạng thái phê duyệt',
  })
  @Index('idx_approval_status')
  approval_status: string;

  @Column({ type: 'int', nullable: true, comment: 'FK to users.id - Người phê duyệt' })
  @Index('idx_approved_by')
  approved_by: number;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian phê duyệt' })
  approved_at: Date;

  @Column({ type: 'int', nullable: true, comment: 'FK to users.id - Người từ chối' })
  @Index('idx_rejected_by')
  rejected_by: number;

  @Column({ type: 'timestamp', nullable: true, comment: 'Thời gian từ chối' })
  rejected_at: Date;

  @Column({ type: 'text', nullable: true, comment: 'Lý do từ chối' })
  rejection_reason: string;

  @Column({ type: 'text', nullable: true, comment: 'Lý do chỉnh sửa' })
  edit_reason: string;

  // Ghi chú
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Địa điểm chấm công (GPS, địa chỉ)' })
  location: string;

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
  @ManyToOne(() => Employee, (emp) => emp.attendanceRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => CatAttendanceTypes, { nullable: true })
  @JoinColumn({ name: 'attendance_type_id' })
  attendanceType: CatAttendanceTypes;
}

