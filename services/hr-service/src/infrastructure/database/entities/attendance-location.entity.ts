import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('attendance_locations')
export class AttendanceLocation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 200, comment: 'Tên địa điểm' })
  @Index('idx_name')
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Địa chỉ' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, comment: 'Vĩ độ GPS' })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, comment: 'Kinh độ GPS' })
  longitude: number;

  @Column({ type: 'int', default: 100, comment: 'Bán kính cho phép (mét)' })
  radius_meters: number;

  @Column({ type: 'text', nullable: true, comment: 'Mô tả' })
  description: string;

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

