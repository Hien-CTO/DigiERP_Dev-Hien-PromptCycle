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

@Entity('attendance_configurations')
export class AttendanceConfiguration {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: ['GLOBAL', 'DEPARTMENT', 'POSITION'],
    default: 'GLOBAL',
    comment: 'Loại cấu hình',
  })
  @Index('idx_config_type')
  config_type: string;

  @Column({ type: 'int', nullable: true, comment: 'FK to departments.id (nếu config_type = DEPARTMENT)' })
  @Index('idx_department_id')
  department_id: number;

  @Column({ type: 'int', nullable: true, comment: 'FK to positions.id (nếu config_type = POSITION)' })
  @Index('idx_position_id')
  position_id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 8.0, comment: 'Số giờ làm việc tiêu chuẩn mỗi ngày' })
  standard_working_hours: number;

  @Column({ type: 'int', default: 60, comment: 'Thời gian nghỉ trưa (phút)' })
  break_duration_minutes: number;

  @Column({ type: 'time', default: '09:00:00', comment: 'Thời gian muộn (mặc định 9:00 AM)' })
  late_threshold_time: string;

  @Column({ type: 'time', default: '17:00:00', comment: 'Thời gian về sớm (mặc định 5:00 PM)' })
  early_leave_threshold_time: string;

  @Column({ type: 'time', default: '06:00:00', comment: 'Thời gian check-in sớm nhất (mặc định 6:00 AM)' })
  earliest_check_in_time: string;

  @Column({ type: 'time', default: '23:59:59', comment: 'Thời gian check-out muộn nhất' })
  latest_check_out_time: string;

  @Column({ type: 'tinyint', default: 0, comment: 'Bật/tắt validation địa điểm' })
  location_validation_enabled: boolean;

  @Column({ type: 'int', default: 100, comment: 'Bán kính cho phép (mét)' })
  allowed_location_radius_meters: number;

  @Column({
    type: 'enum',
    enum: ['SIMPLE', 'TIERED'],
    default: 'SIMPLE',
    comment: 'Phương pháp tính overtime',
  })
  overtime_calculation_method: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5, comment: 'Hệ số nhân cho overtime (1.5 = 150%)' })
  overtime_rate_multiplier: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0, comment: 'Hệ số nhân cho overtime cuối tuần' })
  weekend_overtime_rate_multiplier: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.0, comment: 'Hệ số nhân cho overtime ngày lễ' })
  holiday_overtime_rate_multiplier: number;

  @Column({ type: 'tinyint', default: 1, comment: 'Trạng thái active' })
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

