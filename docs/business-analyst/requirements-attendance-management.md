# Requirements Detail - Attendance Management (Chấm Công)

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Feature**: FEAT-008-005 - Attendance Management (Chấm Công)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Business Analyst

Tài liệu này mô tả chi tiết các requirements về data, entities, và relationships cho tính năng Chấm Công.

---

## 🎯 Business Requirements Summary

Tính năng Chấm Công cho phép nhân viên check-in/check-out hàng ngày, tự động tính toán giờ làm việc và overtime, hỗ trợ workflow phê duyệt, và tích hợp với payroll system.

**Key Business Goals**:
- Tự động hóa quy trình chấm công
- Tăng độ chính xác trong tính toán giờ làm việc
- Đảm bảo tuân thủ quy định lao động
- Cung cấp dữ liệu chính xác cho payroll

---

## 📊 Data Requirements

### Core Entities

#### 1. Attendance Record (attendance_records)

**Purpose**: Lưu trữ bản ghi chấm công hàng ngày của nhân viên

**Attributes**:
- `id` (PK): Unique identifier
- `employee_id` (FK): Reference to employees table
- `attendance_date` (DATE): Ngày chấm công
- `attendance_type_id` (FK, nullable): Reference to cat_attendance_types
- `check_in_time` (DATETIME): Thời gian check-in
- `check_out_time` (DATETIME, nullable): Thời gian check-out
- `location` (VARCHAR(255), nullable): Địa điểm chấm công (GPS hoặc address)
- `working_hours` (DECIMAL(5,2)): Tổng giờ làm việc (tính toán)
- `overtime_hours` (DECIMAL(5,2), default 0): Giờ làm thêm (tính toán)
- `break_time` (DECIMAL(4,2), default 1.0): Thời gian nghỉ (giờ)
- `late` (BOOLEAN, default false): Có đi muộn không
- `late_minutes` (INT, default 0): Số phút đi muộn
- `late_reason` (TEXT, nullable): Lý do đi muộn
- `early_leave` (BOOLEAN, default false): Có về sớm không
- `early_leave_minutes` (INT, default 0): Số phút về sớm
- `early_leave_reason` (TEXT, nullable): Lý do về sớm
- `type` (ENUM): NORMAL, OVERTIME, HOLIDAY, WEEKEND
- `status` (ENUM): CHECKED_IN, COMPLETED, PENDING_APPROVAL, APPROVED, REJECTED
- `approval_status` (ENUM): PENDING, APPROVED, REJECTED
- `approved_by` (FK, nullable): Reference to users table (manager)
- `approved_at` (DATETIME, nullable): Thời gian approve
- `rejected_by` (FK, nullable): Reference to users table
- `rejected_at` (DATETIME, nullable): Thời gian reject
- `rejection_reason` (TEXT, nullable): Lý do từ chối
- `edit_reason` (TEXT, nullable): Lý do chỉnh sửa (nếu có edit)
- `notes` (TEXT, nullable): Ghi chú
- `created_at` (TIMESTAMP): Thời gian tạo
- `created_by` (FK): Reference to users table
- `updated_at` (TIMESTAMP): Thời gian cập nhật
- `updated_by` (FK): Reference to users table

**Business Rules**:
- Mỗi employee chỉ có 1 attendance record mỗi ngày (unique constraint: employee_id + attendance_date)
- check_out_time phải > check_in_time
- working_hours = (check_out_time - check_in_time) - break_time
- overtime_hours = working_hours - standard_working_hours (nếu > 0)
- late = true nếu check_in_time > late_threshold
- early_leave = true nếu check_out_time < early_leave_threshold

**Indexes**:
- Primary key: `id`
- Unique: `(employee_id, attendance_date)`
- Index: `employee_id`, `attendance_date`, `status`, `approval_status`, `approved_by`

#### 2. Attendance Type (cat_attendance_types)

**Purpose**: Danh mục loại chấm công

**Attributes**:
- `id` (PK): Unique identifier
- `code` (VARCHAR(50), unique): Mã loại chấm công
- `name` (VARCHAR(255)): Tên loại chấm công
- `description` (TEXT, nullable): Mô tả
- `is_active` (BOOLEAN, default true): Có active không
- `sort_order` (INT, default 0): Thứ tự sắp xếp
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Default Values**:
- NORMAL: Chấm công bình thường
- OVERTIME: Làm thêm giờ
- HOLIDAY: Ngày lễ
- WEEKEND: Cuối tuần

#### 3. Attendance Configuration (attendance_configurations) - Planned

**Purpose**: Cấu hình rules và policies cho attendance

**Attributes**:
- `id` (PK)
- `department_id` (FK, nullable): Department-specific rules (null = global)
- `position_id` (FK, nullable): Position-specific rules
- `standard_working_hours` (DECIMAL(4,2), default 8.0): Giờ làm việc chuẩn/ngày
- `break_time` (DECIMAL(4,2), default 1.0): Thời gian nghỉ (giờ)
- `late_threshold` (TIME, default '09:00:00'): Ngưỡng đi muộn
- `early_leave_threshold` (TIME, default '17:00:00'): Ngưỡng về sớm
- `overtime_rate` (DECIMAL(5,2), default 1.5): Hệ số tính overtime
- `weekend_overtime_rate` (DECIMAL(5,2), default 2.0): Hệ số overtime cuối tuần
- `holiday_overtime_rate` (DECIMAL(5,2), default 2.5): Hệ số overtime ngày lễ
- `is_active` (BOOLEAN, default true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Business Rules**:
- Position rules override department rules
- Department rules override global rules
- Nếu không có position/department specific rules, dùng global rules

### Relationships

1. **Employee → Attendance Records**: One-to-Many
   - Một employee có nhiều attendance records
   - Foreign key: `attendance_records.employee_id → employees.id`

2. **Attendance Type → Attendance Records**: One-to-Many (optional)
   - Một attendance type có nhiều attendance records
   - Foreign key: `attendance_records.attendance_type_id → cat_attendance_types.id`

3. **User → Attendance Records (Approver)**: One-to-Many
   - Một user (manager) có thể approve nhiều attendance records
   - Foreign keys: `attendance_records.approved_by → users.id`, `attendance_records.rejected_by → users.id`

4. **User → Attendance Records (Creator/Updater)**: One-to-Many
   - Foreign keys: `attendance_records.created_by → users.id`, `attendance_records.updated_by → users.id`

---

## 🔄 Process Flows

### Flow 1: Daily Check-In/Check-Out Process

```
Employee Login
    ↓
Check-In
    ↓
System validates (no duplicate, time >= 6 AM, employee active)
    ↓
Create attendance record (status = CHECKED_IN)
    ↓
Calculate late status (if check-in > 9 AM)
    ↓
[End of Day]
    ↓
Check-Out
    ↓
System validates (has check-in, check-out > check-in)
    ↓
Update attendance record
    ↓
Calculate working hours, overtime, early leave
    ↓
Set status (COMPLETED or PENDING_APPROVAL)
    ↓
Notify Manager (if PENDING_APPROVAL)
```

### Flow 2: Attendance Approval Process

```
Manager views pending approvals
    ↓
Manager reviews attendance record
    ↓
Manager approves or rejects
    ↓
If Approve:
    - Update approval_status = APPROVED
    - Notify employee
    - Mark as ready for payroll
    ↓
If Reject:
    - Update approval_status = REJECTED
    - Require rejection reason
    - Notify employee with reason
```

### Flow 3: Attendance Edit Process

```
Employee views attendance history
    ↓
Employee selects record to edit
    ↓
System checks: Record < 24 hours old?
    ↓
If Yes:
    - Allow edit
    - Require edit reason
    - Set status = PENDING_APPROVAL
    - Log in audit trail
    ↓
If No:
    - Require Manager approval to edit
```

---

## 📋 Functional Requirements

### FR-ATT-001: Check-In Functionality
- Employee có thể check-in qua web app hoặc mobile app
- System tự động lấy timestamp và location
- System validate và tạo attendance record
- System tính toán late status

### FR-ATT-002: Check-Out Functionality
- Employee có thể check-out sau khi đã check-in
- System tự động tính toán working hours và overtime
- System đánh dấu early leave nếu applicable
- System set status phù hợp

### FR-ATT-003: Attendance History Viewing
- Employee xem được attendance records của mình
- Manager xem được attendance records của department
- HR Manager xem được tất cả attendance records
- Support filtering và search

### FR-ATT-004: Attendance Editing
- Employee có thể edit trong 24 giờ
- System require edit reason
- System log all changes
- System set status = PENDING_APPROVAL after edit

### FR-ATT-005: Attendance Approval
- Manager có thể approve/reject attendance records
- System require rejection reason
- System send notifications
- System support bulk approval

### FR-ATT-006: Attendance Reports
- HR Manager có thể generate reports
- Reports support multiple formats (Excel, PDF, CSV)
- Reports include statistics and trends
- System alert unusual patterns

### FR-ATT-007: Attendance Export
- Payroll Specialist có thể export data
- Export only approved records (default)
- Export support multiple formats
- Export action logged

### FR-ATT-008: Attendance Configuration
- HR Manager có thể configure rules
- Support global, department, và position-specific rules
- Rules apply to calculations automatically

---

## 🔒 Security Requirements

1. **Authentication**: Employee phải login để check-in/check-out
2. **Authorization**: 
   - Employee chỉ có thể xem/edit attendance của mình
   - Manager chỉ có thể approve attendance của department mình
   - HR Manager có full access
3. **Data Protection**: Attendance data phải được bảo vệ và audit
4. **Location Privacy**: Location data chỉ visible cho employee và authorized managers

---

## 📈 Performance Requirements

1. **Check-In/Check-Out Response Time**: < 1 second
2. **Attendance History Loading**: < 2 seconds for 100 records
3. **Report Generation**: < 5 seconds for monthly report
4. **Export Processing**: < 10 seconds for 1000 records

---

## 🔗 Integration Requirements

1. **User Service**: 
   - Authenticate employee
   - Get employee information
   - Get user roles and permissions

2. **Financial Service** (planned):
   - Export approved attendance data
   - Real-time sync for payroll calculation
   - API endpoint for attendance data retrieval

---

## 📝 Data Requirements Summary

**Primary Tables**:
- `attendance_records`: Core attendance data
- `cat_attendance_types`: Attendance type catalog
- `attendance_configurations`: Rules configuration (planned)

**Related Tables**:
- `employees`: Employee information
- `users`: User accounts and authentication
- `departments`: Department information (for filtering)
- `positions`: Position information (for rules)

**Audit Requirements**:
- All attendance record changes must be logged
- Edit history must be maintained
- Approval/rejection actions must be tracked

---

**Last Updated**: November 2025  
**Next Review**: December 2025

