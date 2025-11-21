-- Migration: ExtendAttendanceManagement1735000000000
-- Description: Extend attendance_records table and create new tables for attendance management

-- 1. Extend attendance_records table with additional fields
ALTER TABLE attendance_records
  ADD COLUMN check_in_location VARCHAR(255) NULL COMMENT 'Địa điểm check-in (GPS hoặc địa chỉ)' AFTER location,
  ADD COLUMN check_in_latitude DECIMAL(10, 8) NULL COMMENT 'Vĩ độ GPS check-in' AFTER check_in_location,
  ADD COLUMN check_in_longitude DECIMAL(11, 8) NULL COMMENT 'Kinh độ GPS check-in' AFTER check_in_latitude,
  ADD COLUMN check_out_location VARCHAR(255) NULL COMMENT 'Địa điểm check-out (GPS hoặc địa chỉ)' AFTER check_in_longitude,
  ADD COLUMN check_out_latitude DECIMAL(10, 8) NULL COMMENT 'Vĩ độ GPS check-out' AFTER check_out_location,
  ADD COLUMN check_out_longitude DECIMAL(11, 8) NULL COMMENT 'Kinh độ GPS check-out' AFTER check_out_latitude,
  ADD COLUMN late_reason TEXT NULL COMMENT 'Lý do đi muộn' AFTER early_leave_minutes,
  ADD COLUMN early_leave_reason TEXT NULL COMMENT 'Lý do về sớm' AFTER late_reason,
  ADD COLUMN edit_reason TEXT NULL COMMENT 'Lý do chỉnh sửa' AFTER early_leave_reason,
  ADD COLUMN is_edited TINYINT(1) DEFAULT 0 COMMENT 'Đã được chỉnh sửa' AFTER edit_reason,
  ADD COLUMN edited_at TIMESTAMP NULL COMMENT 'Thời gian chỉnh sửa' AFTER is_edited,
  ADD COLUMN edited_by INT NULL COMMENT 'FK to users.id - Người chỉnh sửa' AFTER edited_at,
  ADD COLUMN special_case_type ENUM('NORMAL', 'REMOTE_WORK', 'BUSINESS_TRIP', 'HOLIDAY_WORK', 'WEEKEND_WORK') 
    DEFAULT 'NORMAL' COMMENT 'Loại trường hợp đặc biệt' AFTER type,
  ADD COLUMN approval_notes TEXT NULL COMMENT 'Ghi chú khi phê duyệt/từ chối' AFTER rejection_reason,
  MODIFY COLUMN type ENUM('WORK', 'OVERTIME', 'LEAVE', 'HOLIDAY', 'ABSENT', 'SICK', 'REMOTE_WORK', 'BUSINESS_TRIP', 'OTHER') 
    DEFAULT 'WORK',
  MODIFY COLUMN status ENUM('CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED') 
    DEFAULT 'CHECKED_IN';

-- Add indexes for new fields
CREATE INDEX idx_special_case_type ON attendance_records(special_case_type);
CREATE INDEX idx_is_edited ON attendance_records(is_edited);
CREATE INDEX idx_edited_by ON attendance_records(edited_by);

-- Add foreign key for edited_by
ALTER TABLE attendance_records
  ADD CONSTRAINT fk_attendance_records_edited_by 
  FOREIGN KEY (edited_by) REFERENCES users(id) 
  ON DELETE SET NULL;

-- 2. Create attendance_edit_history table for audit trail
CREATE TABLE attendance_edit_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attendance_record_id INT NOT NULL COMMENT 'FK to attendance_records.id',
  field_name VARCHAR(100) NOT NULL COMMENT 'Tên field được thay đổi',
  old_value TEXT NULL COMMENT 'Giá trị cũ',
  new_value TEXT NULL COMMENT 'Giá trị mới',
  edit_reason TEXT NULL COMMENT 'Lý do chỉnh sửa',
  edited_by INT NULL COMMENT 'FK to users.id',
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian chỉnh sửa',
  INDEX idx_attendance_record_id (attendance_record_id),
  INDEX idx_edited_by (edited_by),
  INDEX idx_edited_at (edited_at),
  CONSTRAINT fk_attendance_edit_history_attendance_record 
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_attendance_edit_history_edited_by 
    FOREIGN KEY (edited_by) REFERENCES users(id) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create attendance_configurations table for rules configuration
CREATE TABLE attendance_configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_type ENUM('GLOBAL', 'DEPARTMENT', 'POSITION') DEFAULT 'GLOBAL' COMMENT 'Loại cấu hình',
  department_id INT NULL COMMENT 'FK to departments.id (nếu config_type = DEPARTMENT)',
  position_id INT NULL COMMENT 'FK to positions.id (nếu config_type = POSITION)',
  standard_working_hours DECIMAL(5,2) DEFAULT 8.0 COMMENT 'Số giờ làm việc tiêu chuẩn mỗi ngày',
  break_duration_minutes INT DEFAULT 60 COMMENT 'Thời gian nghỉ trưa (phút)',
  late_threshold_time TIME DEFAULT '09:00:00' COMMENT 'Thời gian muộn (mặc định 9:00 AM)',
  early_leave_threshold_time TIME DEFAULT '17:00:00' COMMENT 'Thời gian về sớm (mặc định 5:00 PM)',
  earliest_check_in_time TIME DEFAULT '06:00:00' COMMENT 'Thời gian check-in sớm nhất (mặc định 6:00 AM)',
  latest_check_out_time TIME DEFAULT '23:59:59' COMMENT 'Thời gian check-out muộn nhất',
  location_validation_enabled TINYINT DEFAULT 0 COMMENT 'Bật/tắt validation địa điểm',
  allowed_location_radius_meters INT DEFAULT 100 COMMENT 'Bán kính cho phép (mét)',
  overtime_calculation_method ENUM('SIMPLE', 'TIERED') DEFAULT 'SIMPLE' COMMENT 'Phương pháp tính overtime',
  overtime_rate_multiplier DECIMAL(5,2) DEFAULT 1.5 COMMENT 'Hệ số nhân cho overtime (1.5 = 150%)',
  weekend_overtime_rate_multiplier DECIMAL(5,2) DEFAULT 2.0 COMMENT 'Hệ số nhân cho overtime cuối tuần',
  holiday_overtime_rate_multiplier DECIMAL(5,2) DEFAULT 3.0 COMMENT 'Hệ số nhân cho overtime ngày lễ',
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_by INT NULL,
  INDEX idx_config_type (config_type),
  INDEX idx_department_id (department_id),
  INDEX idx_position_id (position_id),
  INDEX idx_is_active (is_active),
  CONSTRAINT fk_attendance_configurations_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_attendance_configurations_position 
    FOREIGN KEY (position_id) REFERENCES positions(id) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create attendance_locations table for allowed locations
CREATE TABLE attendance_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL COMMENT 'Tên địa điểm',
  address TEXT NULL COMMENT 'Địa chỉ',
  latitude DECIMAL(10,8) NOT NULL COMMENT 'Vĩ độ GPS',
  longitude DECIMAL(11,8) NOT NULL COMMENT 'Kinh độ GPS',
  radius_meters INT DEFAULT 100 COMMENT 'Bán kính cho phép (mét)',
  description TEXT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_by INT NULL,
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insert default attendance types if not exists
INSERT INTO cat_attendance_types (code, name, description, is_active, sort_order, created_at, updated_at)
VALUES 
  ('NORMAL', 'Chấm công bình thường', 'Chấm công làm việc bình thường', 1, 1, NOW(), NOW()),
  ('REMOTE_WORK', 'Làm việc từ xa', 'Chấm công khi làm việc từ xa', 1, 2, NOW(), NOW()),
  ('BUSINESS_TRIP', 'Công tác', 'Chấm công khi đi công tác', 1, 3, NOW(), NOW()),
  ('HOLIDAY_WORK', 'Làm việc ngày lễ', 'Chấm công khi làm việc vào ngày lễ', 1, 4, NOW(), NOW()),
  ('WEEKEND_WORK', 'Làm việc cuối tuần', 'Chấm công khi làm việc cuối tuần', 1, 5, NOW(), NOW()),
  ('OVERTIME', 'Làm thêm giờ', 'Chấm công làm thêm giờ', 1, 6, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- 6. Insert default global attendance configuration
INSERT INTO attendance_configurations 
  (config_type, standard_working_hours, break_duration_minutes, late_threshold_time, 
   early_leave_threshold_time, earliest_check_in_time, latest_check_out_time,
   location_validation_enabled, allowed_location_radius_meters, 
   overtime_calculation_method, overtime_rate_multiplier, 
   weekend_overtime_rate_multiplier, holiday_overtime_rate_multiplier,
   is_active, created_at, updated_at)
VALUES 
  ('GLOBAL', 8.0, 60, '09:00:00', '17:00:00', '06:00:00', '23:59:59',
   0, 100, 'SIMPLE', 1.5, 2.0, 3.0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

