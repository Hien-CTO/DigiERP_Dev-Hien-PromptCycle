# Database Schema - Attendance Management (Chấm Công)

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Feature**: FEAT-008-005 - Attendance Management (Chấm Công)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Database Engineer

Tài liệu này mô tả database schema cho tính năng Chấm Công (Attendance Management) của hệ thống DigiERP.

---

## 🗄️ Database Tables

### 1. attendance_records

**Purpose**: Lưu trữ bản ghi chấm công hàng ngày của nhân viên

**Table Name**: `attendance_records`

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| employee_id | INT | NO | - | FK to employees.id |
| attendance_date | DATE | NO | - | Ngày chấm công |
| attendance_type_id | INT | YES | NULL | FK to cat_attendance_types.id |
| check_in_time | DATETIME | NO | - | Thời gian check-in |
| check_out_time | DATETIME | YES | NULL | Thời gian check-out |
| location | VARCHAR(255) | YES | NULL | Địa điểm chấm công (GPS/address) |
| break_time | DECIMAL(4,2) | NO | 1.0 | Thời gian nghỉ (giờ) |
| working_hours | DECIMAL(5,2) | YES | NULL | Tổng giờ làm việc (tính toán) |
| overtime_hours | DECIMAL(5,2) | NO | 0.00 | Giờ làm thêm (tính toán) |
| late | BOOLEAN | NO | false | Có đi muộn không |
| late_minutes | INT | NO | 0 | Số phút đi muộn |
| late_reason | TEXT | YES | NULL | Lý do đi muộn |
| early_leave | BOOLEAN | NO | false | Có về sớm không |
| early_leave_minutes | INT | NO | 0 | Số phút về sớm |
| early_leave_reason | TEXT | YES | NULL | Lý do về sớm |
| type | ENUM | NO | 'NORMAL' | Loại chấm công: NORMAL, OVERTIME, HOLIDAY, WEEKEND |
| status | ENUM | NO | 'CHECKED_IN' | Trạng thái: CHECKED_IN, COMPLETED, PENDING_APPROVAL, APPROVED, REJECTED |
| approval_status | ENUM | NO | 'PENDING' | Trạng thái phê duyệt: PENDING, APPROVED, REJECTED |
| approved_by | INT | YES | NULL | FK to users.id - Người phê duyệt |
| approved_at | TIMESTAMP | YES | NULL | Thời gian phê duyệt |
| rejected_by | INT | YES | NULL | FK to users.id - Người từ chối |
| rejected_at | TIMESTAMP | YES | NULL | Thời gian từ chối |
| rejection_reason | TEXT | YES | NULL | Lý do từ chối |
| edit_reason | TEXT | YES | NULL | Lý do chỉnh sửa |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| created_by | INT | YES | NULL | FK to users.id - Người tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| updated_by | INT | YES | NULL | FK to users.id - Người cập nhật |

**Primary Key**: `id`

**Unique Constraints**:
- `uk_employee_date`: (employee_id, attendance_date) - Mỗi employee chỉ có 1 record mỗi ngày

**Indexes**:
- `idx_employee_id`: employee_id
- `idx_attendance_date`: attendance_date
- `idx_type`: type
- `idx_status`: status
- `idx_approval_status`: approval_status
- `idx_approved_by`: approved_by
- `idx_rejected_by`: rejected_by
- `idx_late`: late
- `idx_early_leave`: early_leave

**Foreign Keys**:
- `employee_id` → `employees.id` (ON DELETE CASCADE)
- `attendance_type_id` → `cat_attendance_types.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)
- `created_by` → `users.id` (ON DELETE SET NULL)
- `updated_by` → `users.id` (ON DELETE SET NULL)

**Check Constraints**:
- `chk_checkout_after_checkin`: check_out_time IS NULL OR check_out_time >= check_in_time
- `chk_working_hours_range`: working_hours IS NULL OR (working_hours >= 0 AND working_hours <= 16)
- `chk_overtime_hours`: overtime_hours >= 0

**Business Rules**:
- Mỗi employee chỉ có 1 attendance record mỗi ngày
- check_out_time phải > check_in_time
- working_hours = (check_out_time - check_in_time) - break_time
- overtime_hours = working_hours - standard_working_hours (nếu > 0)
- late = true nếu check_in_time > late_threshold
- early_leave = true nếu check_out_time < early_leave_threshold

---

### 2. cat_attendance_types

**Purpose**: Danh mục loại chấm công

**Table Name**: `cat_attendance_types`

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| code | VARCHAR(20) | NO | - | Mã loại chấm công (unique) |
| name | VARCHAR(100) | NO | - | Tên loại chấm công |
| description | TEXT | YES | NULL | Mô tả |
| is_active | BOOLEAN | NO | true | Có active không |
| sort_order | INT | NO | 0 | Thứ tự sắp xếp |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | FK to users.id |
| updated_by | INT | YES | NULL | FK to users.id |

**Primary Key**: `id`

**Unique Constraints**:
- `code`: Unique

**Indexes**:
- `idx_code`: code
- `idx_name`: name
- `idx_is_active`: is_active

**Default Values**:
- NORMAL: Chấm công bình thường
- OVERTIME: Làm thêm giờ
- HOLIDAY: Ngày lễ
- WEEKEND: Cuối tuần

---

### 3. attendance_configurations

**Purpose**: Cấu hình rules và policies cho attendance (global, department, position-specific)

**Table Name**: `attendance_configurations`

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| department_id | INT | YES | NULL | FK to departments.id (null = global) |
| position_id | INT | YES | NULL | FK to positions.id (position-specific) |
| standard_working_hours | DECIMAL(4,2) | NO | 8.0 | Giờ làm việc chuẩn/ngày |
| break_time | DECIMAL(4,2) | NO | 1.0 | Thời gian nghỉ (giờ) |
| late_threshold | TIME | NO | '09:00:00' | Ngưỡng đi muộn |
| early_leave_threshold | TIME | NO | '17:00:00' | Ngưỡng về sớm |
| overtime_rate | DECIMAL(5,2) | NO | 1.5 | Hệ số tính overtime |
| weekend_overtime_rate | DECIMAL(5,2) | NO | 2.0 | Hệ số overtime cuối tuần |
| holiday_overtime_rate | DECIMAL(5,2) | NO | 2.5 | Hệ số overtime ngày lễ |
| is_active | BOOLEAN | NO | true | Có active không |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | FK to users.id |
| updated_by | INT | YES | NULL | FK to users.id |

**Primary Key**: `id`

**Indexes**:
- `idx_department_id`: department_id
- `idx_position_id`: position_id
- `idx_is_active`: is_active

**Foreign Keys**:
- `department_id` → `departments.id` (ON DELETE CASCADE)
- `position_id` → `positions.id` (ON DELETE CASCADE)
- `created_by` → `users.id` (ON DELETE SET NULL)
- `updated_by` → `users.id` (ON DELETE SET NULL)

**Check Constraints**:
- `chk_standard_working_hours`: standard_working_hours > 0 AND standard_working_hours <= 24
- `chk_break_time`: break_time >= 0 AND break_time <= 8
- `chk_overtime_rate`: overtime_rate > 0

**Business Rules**:
- Position rules override department rules
- Department rules override global rules (department_id = NULL, position_id = NULL)
- Nếu không có position/department specific rules, dùng global rules
- Chỉ có một active configuration cho mỗi department/position combination (enforced by business logic)

---

## 🔗 Entity Relationships

### ERD (Text-based)

```
employees (1) ───────< (N) attendance_records
    │
    │ employee_id (FK)
    │
    └───> (1) ───────< (N) users (approved_by, rejected_by, created_by, updated_by)

cat_attendance_types (1) ───────< (N) attendance_records
    │
    │ attendance_type_id (FK, nullable)

departments (1) ───────< (N) attendance_configurations
    │
    │ department_id (FK, nullable)

positions (1) ───────< (N) attendance_configurations
    │
    │ position_id (FK, nullable)
```

### Relationship Details

1. **Employee → Attendance Records**: One-to-Many
   - Một employee có nhiều attendance records
   - Foreign key: `attendance_records.employee_id → employees.id`
   - ON DELETE: CASCADE (khi xóa employee, xóa tất cả attendance records)

2. **Attendance Type → Attendance Records**: One-to-Many (optional)
   - Một attendance type có nhiều attendance records
   - Foreign key: `attendance_records.attendance_type_id → cat_attendance_types.id`
   - ON DELETE: SET NULL

3. **User → Attendance Records (Approver)**: One-to-Many
   - Một user (manager) có thể approve/reject nhiều attendance records
   - Foreign keys: `attendance_records.approved_by → users.id`, `attendance_records.rejected_by → users.id`
   - ON DELETE: SET NULL

4. **User → Attendance Records (Creator/Updater)**: One-to-Many
   - Foreign keys: `attendance_records.created_by → users.id`, `attendance_records.updated_by → users.id`
   - ON DELETE: SET NULL

5. **Department → Attendance Configurations**: One-to-Many
   - Một department có thể có nhiều configurations (nhưng chỉ một active)
   - Foreign key: `attendance_configurations.department_id → departments.id`
   - ON DELETE: CASCADE

6. **Position → Attendance Configurations**: One-to-Many
   - Một position có thể có nhiều configurations (nhưng chỉ một active)
   - Foreign key: `attendance_configurations.position_id → positions.id`
   - ON DELETE: CASCADE

---

## 📊 Indexes Strategy

### attendance_records Indexes

1. **Primary Key**: `id` - Auto-increment, unique
2. **Unique Index**: `uk_employee_date` (employee_id, attendance_date) - Đảm bảo mỗi employee chỉ có 1 record/ngày
3. **Index on employee_id**: `idx_employee_id` - Cho queries filter theo employee
4. **Index on attendance_date**: `idx_attendance_date` - Cho queries filter theo date range
5. **Index on status**: `idx_status` - Cho queries filter theo status
6. **Index on approval_status**: `idx_approval_status` - Cho queries filter theo approval status
7. **Index on approved_by**: `idx_approved_by` - Cho queries filter theo approver
8. **Index on rejected_by**: `idx_rejected_by` - Cho queries filter theo rejector
9. **Index on late**: `idx_late` - Cho queries filter late records
10. **Index on early_leave**: `idx_early_leave` - Cho queries filter early leave records
11. **Index on type**: `idx_type` - Cho queries filter theo type

**Composite Indexes** (for common queries):
- (employee_id, attendance_date) - Already unique
- (employee_id, status) - For employee status queries
- (approval_status, attendance_date) - For pending approval queries by date

### cat_attendance_types Indexes

1. **Primary Key**: `id`
2. **Unique Index**: `code` - Đảm bảo code unique
3. **Index on name**: `idx_name` - Cho search
4. **Index on is_active**: `idx_is_active` - Cho filter active types

### attendance_configurations Indexes

1. **Primary Key**: `id`
2. **Index on department_id**: `idx_department_id` - Cho queries filter theo department
3. **Index on position_id**: `idx_position_id` - Cho queries filter theo position
4. **Index on is_active**: `idx_is_active` - Cho filter active configurations

---

## 🔒 Constraints and Data Integrity

### Primary Keys
- `attendance_records.id`: Primary key
- `cat_attendance_types.id`: Primary key
- `attendance_configurations.id`: Primary key

### Unique Constraints
- `attendance_records`: (employee_id, attendance_date) - Mỗi employee chỉ có 1 record/ngày
- `cat_attendance_types.code`: Code phải unique

### Foreign Key Constraints
- Tất cả foreign keys đều có ON DELETE rules phù hợp
- CASCADE cho employee → attendance_records (khi xóa employee)
- SET NULL cho optional relationships

### Check Constraints
- `chk_checkout_after_checkin`: check_out_time >= check_in_time
- `chk_working_hours_range`: working_hours >= 0 AND working_hours <= 16
- `chk_overtime_hours`: overtime_hours >= 0
- `chk_standard_working_hours`: standard_working_hours > 0 AND <= 24
- `chk_break_time`: break_time >= 0 AND <= 8
- `chk_overtime_rate`: overtime_rate > 0

---

## 📈 Performance Considerations

### Query Optimization

**Common Queries**:
1. Get employee attendance by date range
   - Index: (employee_id, attendance_date)
   
2. Get pending approvals for manager
   - Index: (approval_status, approved_by, attendance_date)
   
3. Get attendance reports by department
   - Index: (attendance_date, status) + JOIN với employees.department_id

4. Calculate working hours and overtime
   - Computed columns hoặc stored procedures
   - Indexes on working_hours, overtime_hours for aggregation

### Denormalization Considerations

**Computed Fields** (stored for performance):
- `working_hours`: Calculated and stored
- `overtime_hours`: Calculated and stored
- `late_minutes`: Calculated and stored
- `early_leave_minutes`: Calculated and stored

**Rationale**: These fields are frequently queried and aggregated, storing them improves query performance.

---

## 🔄 Migration Scripts

### Migration File
- **File**: `scripts/database/migrations/20251119200000-UpdateAttendanceManagement-Schema.ts`
- **Purpose**: Update attendance_records table and create attendance_configurations table
- **Changes**:
  1. Add missing columns to attendance_records
  2. Update enum values
  3. Change break_duration_minutes to break_time
  4. Create attendance_configurations table
  5. Add indexes and constraints

### Running Migration

```bash
# Navigate to scripts/database directory
cd scripts/database

# Run migration
npm run migration:run

# Or using TypeORM CLI
npx typeorm migration:run -d data-source.ts
```

---

## 📝 Data Requirements Summary

**Primary Tables**:
- `attendance_records`: Core attendance data
- `cat_attendance_types`: Attendance type catalog
- `attendance_configurations`: Rules configuration

**Related Tables**:
- `employees`: Employee information
- `users`: User accounts and authentication
- `departments`: Department information
- `positions`: Position information

**Audit Requirements**:
- All attendance record changes logged via created_by, updated_by
- Edit history tracked via edit_reason
- Approval/rejection actions tracked via approved_by, rejected_by, approved_at, rejected_at

---

## ✅ ACID Compliance

- **Atomicity**: Transactions ensure all attendance operations complete or rollback
- **Consistency**: Constraints ensure data integrity
- **Isolation**: Transactions are isolated to prevent conflicts
- **Durability**: All changes are persisted to disk

---

## 🔗 Related Documents

- [Use Cases: Attendance Management](../business-analyst/use-cases-attendance-management.md)
- [Business Rules: Attendance Management](../business-analyst/business-rules-hr-management.md#br-hr-006-attendance-management-chấm-công)
- [Requirements: Attendance Management](../business-analyst/requirements-attendance-management.md)
- [Epic: HR Management](../product-owner/epic-hr-management.md)

---

**Last Updated**: November 2025  
**Next Review**: December 2025

