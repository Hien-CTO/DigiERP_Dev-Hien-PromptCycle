# Database Schema: Attendance Management (Chấm Công)

## 📋 Tổng Quan

**Module**: HR Management - Attendance Management  
**Feature ID**: FEAT-008-005  
**Database**: `Hien_DigiERP_LeHuy_Dev2`  
**Version**: 1.0  
**Last Updated**: November 2025

Tài liệu này mô tả database schema cho tính năng Attendance Management (Chấm Công), bao gồm:
- Core tables cho attendance tracking
- Audit trail và edit history
- Configuration tables cho rules và policies
- Location tracking với GPS support

---

## 🗂️ Database Tables

### 1. attendance_records

**Mục đích**: Lưu trữ bản ghi chấm công hàng ngày của nhân viên

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| employee_id | INT | NO | - | FK to employees.id |
| attendance_date | DATE | NO | - | Ngày chấm công |
| attendance_type_id | INT | YES | NULL | FK to cat_attendance_types.id |
| check_in_time | DATETIME | YES | NULL | Thời gian check-in |
| check_out_time | DATETIME | YES | NULL | Thời gian check-out |
| break_duration_minutes | INT | NO | 0 | Thời gian nghỉ (phút) |
| working_hours | DECIMAL(5,2) | YES | NULL | Số giờ làm việc (tự động tính) |
| overtime_hours | DECIMAL(5,2) | NO | 0 | Số giờ làm thêm |
| late_minutes | INT | NO | 0 | Số phút đi muộn |
| early_leave_minutes | INT | NO | 0 | Số phút về sớm |
| late_reason | TEXT | YES | NULL | Lý do đi muộn |
| early_leave_reason | TEXT | YES | NULL | Lý do về sớm |
| edit_reason | TEXT | YES | NULL | Lý do chỉnh sửa |
| is_edited | TINYINT(1) | NO | 0 | Đã được chỉnh sửa |
| edited_at | TIMESTAMP | YES | NULL | Thời gian chỉnh sửa |
| edited_by | INT | YES | NULL | FK to users.id - Người chỉnh sửa |
| type | ENUM | NO | 'WORK' | Loại chấm công: WORK, OVERTIME, LEAVE, HOLIDAY, ABSENT, SICK, REMOTE_WORK, BUSINESS_TRIP, OTHER |
| special_case_type | ENUM | NO | 'NORMAL' | Loại trường hợp đặc biệt: NORMAL, REMOTE_WORK, BUSINESS_TRIP, HOLIDAY_WORK, WEEKEND_WORK |
| status | ENUM | NO | 'CHECKED_IN' | Trạng thái: CHECKED_IN, COMPLETED, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED |
| approved_by | INT | YES | NULL | FK to users.id - Người phê duyệt |
| approved_at | TIMESTAMP | YES | NULL | Thời gian phê duyệt |
| rejection_reason | TEXT | YES | NULL | Lý do từ chối |
| approval_notes | TEXT | YES | NULL | Ghi chú khi phê duyệt/từ chối |
| location | VARCHAR(255) | YES | NULL | Địa điểm chấm công (deprecated, dùng check_in_location/check_out_location) |
| check_in_location | VARCHAR(255) | YES | NULL | Địa điểm check-in (GPS hoặc địa chỉ) |
| check_in_latitude | DECIMAL(10,8) | YES | NULL | Vĩ độ GPS check-in |
| check_in_longitude | DECIMAL(11,8) | YES | NULL | Kinh độ GPS check-in |
| check_out_location | VARCHAR(255) | YES | NULL | Địa điểm check-out (GPS hoặc địa chỉ) |
| check_out_latitude | DECIMAL(10,8) | YES | NULL | Vĩ độ GPS check-out |
| check_out_longitude | DECIMAL(11,8) | YES | NULL | Kinh độ GPS check-out |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_employee_id` (employee_id)
- `idx_attendance_date` (attendance_date)
- `idx_type` (type)
- `idx_status` (status)
- `idx_approved_by` (approved_by)
- `idx_special_case_type` (special_case_type)
- `idx_is_edited` (is_edited)
- `idx_edited_by` (edited_by)
- `uk_employee_date` (employee_id, attendance_date) - UNIQUE

**Foreign Keys**:
- `employee_id` → `employees.id` (ON DELETE CASCADE)
- `attendance_type_id` → `cat_attendance_types.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `edited_by` → `users.id` (ON DELETE SET NULL)

**Business Rules**:
- Mỗi nhân viên chỉ có 1 bản ghi chấm công mỗi ngày (unique constraint)
- `check_out_time` phải sau `check_in_time`
- `working_hours` được tính tự động: (check_out_time - check_in_time) - break_duration_minutes
- `overtime_hours` = max(0, working_hours - standard_working_hours)
- `late_minutes` được tính nếu check_in_time > late_threshold_time
- `early_leave_minutes` được tính nếu check_out_time < early_leave_threshold_time

---

### 2. attendance_edit_history

**Mục đích**: Lưu trữ lịch sử chỉnh sửa attendance records (audit trail)

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| attendance_record_id | INT | NO | - | FK to attendance_records.id |
| field_name | VARCHAR(100) | NO | - | Tên field được thay đổi |
| old_value | TEXT | YES | NULL | Giá trị cũ |
| new_value | TEXT | YES | NULL | Giá trị mới |
| edit_reason | TEXT | YES | NULL | Lý do chỉnh sửa |
| edited_by | INT | YES | NULL | FK to users.id |
| edited_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian chỉnh sửa |

**Indexes**:
- `idx_attendance_record_id` (attendance_record_id)
- `idx_edited_by` (edited_by)
- `idx_edited_at` (edited_at)

**Foreign Keys**:
- `attendance_record_id` → `attendance_records.id` (ON DELETE CASCADE)
- `edited_by` → `users.id` (ON DELETE SET NULL)

**Business Rules**:
- Mỗi lần chỉnh sửa attendance record sẽ tạo nhiều records trong bảng này (1 record cho mỗi field thay đổi)
- Không được xóa records trong bảng này (audit trail)

---

### 3. attendance_configurations

**Mục đích**: Cấu hình rules và policies cho attendance management

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| config_type | ENUM | NO | 'GLOBAL' | Loại cấu hình: GLOBAL, DEPARTMENT, POSITION |
| department_id | INT | YES | NULL | FK to departments.id (nếu config_type = DEPARTMENT) |
| position_id | INT | YES | NULL | FK to positions.id (nếu config_type = POSITION) |
| standard_working_hours | DECIMAL(5,2) | NO | 8.0 | Số giờ làm việc tiêu chuẩn mỗi ngày |
| break_duration_minutes | INT | NO | 60 | Thời gian nghỉ trưa (phút) |
| late_threshold_time | TIME | NO | '09:00:00' | Thời gian muộn (mặc định 9:00 AM) |
| early_leave_threshold_time | TIME | NO | '17:00:00' | Thời gian về sớm (mặc định 5:00 PM) |
| earliest_check_in_time | TIME | NO | '06:00:00' | Thời gian check-in sớm nhất (mặc định 6:00 AM) |
| latest_check_out_time | TIME | NO | '23:59:59' | Thời gian check-out muộn nhất |
| location_validation_enabled | TINYINT | NO | 0 | Bật/tắt validation địa điểm |
| allowed_location_radius_meters | INT | NO | 100 | Bán kính cho phép (mét) |
| overtime_calculation_method | ENUM | NO | 'SIMPLE' | Phương pháp tính overtime: SIMPLE, TIERED |
| overtime_rate_multiplier | DECIMAL(5,2) | NO | 1.5 | Hệ số nhân cho overtime (1.5 = 150%) |
| weekend_overtime_rate_multiplier | DECIMAL(5,2) | NO | 2.0 | Hệ số nhân cho overtime cuối tuần |
| holiday_overtime_rate_multiplier | DECIMAL(5,2) | NO | 3.0 | Hệ số nhân cho overtime ngày lễ |
| is_active | TINYINT | NO | 1 | Trạng thái active |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_config_type` (config_type)
- `idx_department_id` (department_id)
- `idx_position_id` (position_id)
- `idx_is_active` (is_active)

**Foreign Keys**:
- `department_id` → `departments.id` (ON DELETE CASCADE)
- `position_id` → `positions.id` (ON DELETE CASCADE)

**Business Rules**:
- Chỉ có 1 GLOBAL configuration (config_type = 'GLOBAL', department_id = NULL, position_id = NULL)
- Có thể có nhiều DEPARTMENT configurations (config_type = 'DEPARTMENT', department_id != NULL)
- Có thể có nhiều POSITION configurations (config_type = 'POSITION', position_id != NULL)
- Priority: POSITION > DEPARTMENT > GLOBAL (specific configs override global configs)
- Khi tính toán attendance, system sẽ tìm config theo priority: POSITION → DEPARTMENT → GLOBAL

---

### 4. attendance_locations

**Mục đích**: Quản lý danh sách địa điểm được phép chấm công (GPS locations)

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| name | VARCHAR(200) | NO | - | Tên địa điểm |
| address | TEXT | YES | NULL | Địa chỉ |
| latitude | DECIMAL(10,8) | NO | - | Vĩ độ GPS |
| longitude | DECIMAL(11,8) | NO | - | Kinh độ GPS |
| radius_meters | INT | NO | 100 | Bán kính cho phép (mét) |
| description | TEXT | YES | NULL | Mô tả |
| is_active | TINYINT | NO | 1 | Trạng thái active |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_name` (name)
- `idx_is_active` (is_active)

**Business Rules**:
- Khi `location_validation_enabled = 1` trong attendance_configurations, system sẽ validate GPS coordinates của check-in/check-out với các locations trong bảng này
- Validation: Khoảng cách từ GPS coordinates đến location center phải <= radius_meters
- Có thể có nhiều locations (office, warehouse, remote locations)

---

### 5. cat_attendance_types

**Mục đích**: Danh mục loại chấm công (reference data)

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| code | VARCHAR(20) | NO | UNIQUE | Mã loại chấm công |
| name | VARCHAR(100) | NO | - | Tên loại chấm công |
| description | TEXT | YES | NULL | Mô tả |
| is_active | TINYINT | NO | 1 | Trạng thái active |
| sort_order | INT | NO | 0 | Thứ tự sắp xếp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_code` (code) - UNIQUE
- `idx_name` (name)
- `idx_is_active` (is_active)

**Default Data**:
- `NORMAL`: Chấm công bình thường
- `REMOTE_WORK`: Làm việc từ xa
- `BUSINESS_TRIP`: Công tác
- `HOLIDAY_WORK`: Làm việc ngày lễ
- `WEEKEND_WORK`: Làm việc cuối tuần
- `OVERTIME`: Làm thêm giờ

---

## 🔗 Entity Relationships

```
employees (1) ──< (N) attendance_records
                    │
                    ├──> (N) attendance_edit_history
                    │
                    └──> (1) cat_attendance_types

attendance_configurations
    ├──> (1) departments (nếu config_type = DEPARTMENT)
    └──> (1) positions (nếu config_type = POSITION)

users
    ├──> (1) attendance_records (approved_by)
    ├──> (1) attendance_records (edited_by)
    └──> (1) attendance_edit_history (edited_by)
```

---

## 📊 ERD (Text-based)

```
┌─────────────────┐
│   employees     │
├─────────────────┤
│ id (PK)         │
│ employee_code   │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────────┐
│   attendance_records        │
├─────────────────────────────┤
│ id (PK)                     │
│ employee_id (FK)            │
│ attendance_date             │
│ check_in_time               │
│ check_out_time              │
│ check_in_latitude           │
│ check_in_longitude          │
│ check_out_latitude          │
│ check_out_longitude         │
│ working_hours               │
│ overtime_hours              │
│ late_minutes                │
│ early_leave_minutes         │
│ type                        │
│ special_case_type           │
│ status                      │
│ ...                         │
└────────┬────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────────┐
│ attendance_edit_history     │
├─────────────────────────────┤
│ id (PK)                     │
│ attendance_record_id (FK)    │
│ field_name                  │
│ old_value                   │
│ new_value                   │
│ edit_reason                 │
│ edited_by (FK)              │
│ edited_at                   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ attendance_configurations   │
├─────────────────────────────┤
│ id (PK)                     │
│ config_type                 │
│ department_id (FK)          │
│ position_id (FK)            │
│ standard_working_hours      │
│ late_threshold_time         │
│ early_leave_threshold_time  │
│ location_validation_enabled │
│ ...                         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ attendance_locations        │
├─────────────────────────────┤
│ id (PK)                     │
│ name                        │
│ latitude                    │
│ longitude                   │
│ radius_meters               │
│ ...                         │
└─────────────────────────────┘
```

---

## 🔍 Indexes Strategy

### Primary Indexes
- Tất cả foreign keys đều có indexes
- Composite unique index: `(employee_id, attendance_date)` cho attendance_records

### Query Optimization Indexes
- **attendance_records**:
  - `idx_employee_id`: Filter by employee
  - `idx_attendance_date`: Filter by date range
  - `idx_status`: Filter by approval status
  - `idx_type`: Filter by attendance type
  - `idx_special_case_type`: Filter by special cases
  - `idx_is_edited`: Filter edited records

- **attendance_edit_history**:
  - `idx_attendance_record_id`: Get edit history for a record
  - `idx_edited_at`: Filter by edit time

- **attendance_configurations**:
  - `idx_config_type`: Filter by config type
  - `idx_department_id`: Get department configs
  - `idx_position_id`: Get position configs

### Composite Indexes
- `(employee_id, attendance_date)`: Unique constraint, also used for queries
- `(config_type, department_id, position_id)`: For finding applicable configs

---

## 🔐 Constraints & Data Integrity

### Foreign Key Constraints
- `attendance_records.employee_id` → `employees.id` (ON DELETE CASCADE)
- `attendance_records.attendance_type_id` → `cat_attendance_types.id` (ON DELETE SET NULL)
- `attendance_records.approved_by` → `users.id` (ON DELETE SET NULL)
- `attendance_records.edited_by` → `users.id` (ON DELETE SET NULL)
- `attendance_edit_history.attendance_record_id` → `attendance_records.id` (ON DELETE CASCADE)
- `attendance_configurations.department_id` → `departments.id` (ON DELETE CASCADE)
- `attendance_configurations.position_id` → `positions.id` (ON DELETE CASCADE)

### Unique Constraints
- `attendance_records`: `(employee_id, attendance_date)` - Mỗi nhân viên chỉ có 1 bản ghi mỗi ngày
- `cat_attendance_types.code`: Unique code

### Check Constraints
- `check_out_time >= check_in_time` (enforced at application level)
- `working_hours >= 0 AND working_hours <= 16` (safety limit)
- `overtime_hours >= 0`
- `late_minutes >= 0`
- `early_leave_minutes >= 0`
- `radius_meters > 0` (for attendance_locations)
- `standard_working_hours > 0 AND standard_working_hours <= 24`

---

## 📈 Performance Considerations

### Partitioning Strategy
- Có thể partition `attendance_records` theo `attendance_date` (monthly partitions) nếu data lớn
- Có thể partition `attendance_edit_history` theo `edited_at` (monthly partitions)

### Archiving Strategy
- Archive old attendance records (> 2 years) sang archive table
- Archive old edit history (> 1 year) sang archive table

### Caching Strategy
- Cache `attendance_configurations` (GLOBAL, DEPARTMENT, POSITION) trong Redis
- Cache `attendance_locations` trong Redis
- Cache `cat_attendance_types` trong Redis

---

## 🔄 Migration Scripts

### Migration: 1735000000000-ExtendAttendanceManagement.ts

**Changes**:
1. Extend `attendance_records` table với:
   - GPS location fields (check_in_latitude, check_in_longitude, check_out_latitude, check_out_longitude)
   - Location fields (check_in_location, check_out_location)
   - Reason fields (late_reason, early_leave_reason, edit_reason)
   - Edit tracking fields (is_edited, edited_at, edited_by)
   - Special case type field
   - Approval notes field
   - Extended ENUM values cho type và status

2. Create `attendance_edit_history` table cho audit trail

3. Create `attendance_configurations` table cho rules configuration

4. Create `attendance_locations` table cho GPS location management

5. Insert default data:
   - Default attendance types
   - Default global configuration

---

## 📝 Notes

1. **GPS Coordinates**: Sử dụng DECIMAL(10,8) cho latitude và DECIMAL(11,8) cho longitude để đảm bảo độ chính xác
2. **Location Validation**: Có thể bật/tắt validation địa điểm qua `location_validation_enabled` trong configurations
3. **Edit History**: Mỗi lần edit attendance record sẽ tạo nhiều records trong edit_history (1 record cho mỗi field thay đổi)
4. **Configuration Priority**: POSITION > DEPARTMENT > GLOBAL
5. **Working Hours Calculation**: Được tính tự động tại application level, không dùng generated column để linh hoạt hơn
6. **Overtime Calculation**: Có thể dùng SIMPLE hoặc TIERED method tùy theo configuration

---

**Last Updated**: November 2025  
**Next Review**: December 2025  
**Version**: 1.0

