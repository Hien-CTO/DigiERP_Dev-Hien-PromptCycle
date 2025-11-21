# Requirements Detail - Leave Management (Nghỉ Phép)

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Feature**: FEAT-008-006 - Leave Management (Nghỉ Phép)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Business Analyst

Tài liệu này mô tả chi tiết các requirements về data, entities, và relationships cho tính năng Nghỉ Phép (Leave Management).

---

## 🎯 Business Requirements Summary

Tính năng Nghỉ Phép cho phép nhân viên tạo yêu cầu nghỉ phép, quản lý leave balance, và hỗ trợ workflow phê duyệt đa cấp. Hệ thống hỗ trợ nhiều loại nghỉ phép khác nhau, tự động tính toán leave entitlements, và tích hợp với attendance system.

**Key Business Goals**:
- Tự động hóa quy trình nghỉ phép
- Quản lý leave balance chính xác
- Tuân thủ quy định lao động
- Tích hợp với hệ thống attendance và payroll

---

## 📊 Data Requirements

### Core Entities

#### 1. Leave Request (leave_requests)

**Purpose**: Lưu trữ yêu cầu nghỉ phép của nhân viên

**Attributes**:
- `id` (PK): Unique identifier
- `employee_id` (FK): Reference to employees table
- `leave_type_id` (FK): Reference to cat_leave_types table
- `start_date` (DATE): Ngày bắt đầu nghỉ
- `end_date` (DATE): Ngày kết thúc nghỉ
- `leave_days` (DECIMAL(5,2)): Số ngày nghỉ (tính toán, trừ weekends/holidays)
- `reason` (TEXT, nullable): Lý do nghỉ phép
- `notes` (TEXT, nullable): Ghi chú bổ sung
- `status` (ENUM): PENDING, APPROVED, REJECTED, CANCELLED
- `approved_by` (FK, nullable): Reference to users table (manager)
- `approved_at` (DATETIME, nullable): Thời gian approve
- `approval_notes` (TEXT, nullable): Ghi chú khi approve
- `rejected_by` (FK, nullable): Reference to users table
- `rejected_at` (DATETIME, nullable): Thời gian reject
- `rejection_reason` (TEXT, nullable): Lý do từ chối
- `cancelled_at` (DATETIME, nullable): Thời gian cancel
- `cancellation_reason` (TEXT, nullable): Lý do hủy
- `edit_reason` (TEXT, nullable): Lý do chỉnh sửa (nếu có edit)
- `requires_hr_approval` (BOOLEAN, default false): Yêu cầu approval từ HR Manager
- `attached_documents` (JSON, nullable): Danh sách documents đính kèm
- `created_at` (TIMESTAMP): Thời gian tạo
- `created_by` (FK): Reference to users table
- `updated_at` (TIMESTAMP): Thời gian cập nhật
- `updated_by` (FK): Reference to users table

**Business Rules**:
- Mỗi employee có thể có multiple leave requests
- Leave requests không được overlap (trừ khi có approval đặc biệt)
- Start date >= current date (trừ trường hợp đặc biệt)
- End date >= start date
- Leave days = (end_date - start_date) + 1 (trừ weekends/holidays)
- Status flow: PENDING → APPROVED/REJECTED → TAKEN/CANCELLED

**Indexes**:
- Primary key: `id`
- Index: `employee_id`, `leave_type_id`, `start_date`, `end_date`, `status`, `approved_by`

#### 2. Leave Balance (leave_balances)

**Purpose**: Lưu trữ leave balance của nhân viên theo từng loại nghỉ phép

**Attributes**:
- `id` (PK): Unique identifier
- `employee_id` (FK): Reference to employees table
- `leave_type_id` (FK): Reference to cat_leave_types table
- `year` (INT): Năm của balance (e.g., 2025)
- `entitlement` (DECIMAL(5,2)): Tổng số ngày được cấp (entitlement)
- `used` (DECIMAL(5,2), default 0): Số ngày đã sử dụng
- `pending` (DECIMAL(5,2), default 0): Số ngày đang pending (từ pending requests)
- `remaining` (DECIMAL(5,2)): Số ngày còn lại (calculated: entitlement - used - pending)
- `carry_over` (DECIMAL(5,2), default 0): Số ngày carry-over từ năm trước
- `expired` (DECIMAL(5,2), default 0): Số ngày đã hết hạn
- `expiration_date` (DATE, nullable): Ngày hết hạn (nếu applicable)
- `last_updated` (TIMESTAMP): Thời gian cập nhật cuối
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Business Rules**:
- Mỗi employee có một leave balance record cho mỗi leave type mỗi năm
- Remaining = Entitlement - Used - Pending (calculated)
- Balance được tự động cập nhật khi:
  - Leave request approved (trừ used)
  - Leave request rejected/cancelled (hoàn lại used)
  - Leave entitlements calculated (cập nhật entitlement)
  - Leave expires (cập nhật expired)

**Indexes**:
- Primary key: `id`
- Unique: `(employee_id, leave_type_id, year)`
- Index: `employee_id`, `leave_type_id`, `year`, `expiration_date`

#### 3. Leave Type (cat_leave_types)

**Purpose**: Danh mục loại nghỉ phép

**Attributes**:
- `id` (PK): Unique identifier
- `code` (VARCHAR(50), unique): Mã loại nghỉ phép
- `name` (VARCHAR(255)): Tên loại nghỉ phép
- `description` (TEXT, nullable): Mô tả
- `has_balance` (BOOLEAN, default true): Có balance không (true cho Annual, Sick, Maternity, Paternity; false cho Unpaid, Emergency)
- `requires_approval` (BOOLEAN, default true): Cần approval không
- `requires_medical_certificate` (BOOLEAN, default false): Cần giấy bác sĩ không
- `medical_certificate_threshold` (INT, nullable): Số ngày nghỉ tối thiểu cần giấy bác sĩ (default: 3 cho Sick Leave)
- `gender_restriction` (ENUM, nullable): MALE, FEMALE, NULL (null = không giới hạn)
- `max_days_per_year` (INT, nullable): Số ngày tối đa mỗi năm (null = unlimited)
- `can_carry_over` (BOOLEAN, default false): Có thể carry-over không
- `max_carry_over_days` (INT, nullable): Số ngày carry-over tối đa (default: 5 cho Annual Leave)
- `accrual_type` (ENUM): MONTHLY, QUARTERLY, YEARLY (cách tính entitlement)
- `is_paid` (BOOLEAN, default true): Có lương không (true cho Annual, Sick, Maternity, Paternity; false cho Unpaid, Emergency)
- `is_active` (BOOLEAN, default true): Có active không
- `sort_order` (INT, default 0): Thứ tự sắp xếp
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Default Values**:
- **Annual Leave**: has_balance=true, requires_approval=true, can_carry_over=true, max_carry_over_days=5, is_paid=true
- **Sick Leave**: has_balance=true, requires_approval=true, requires_medical_certificate=true, medical_certificate_threshold=3, is_paid=true
- **Unpaid Leave**: has_balance=false, requires_approval=true, is_paid=false
- **Maternity Leave**: has_balance=true, requires_approval=true, gender_restriction=FEMALE, is_paid=true
- **Paternity Leave**: has_balance=true, requires_approval=true, gender_restriction=MALE, is_paid=true
- **Emergency Leave**: has_balance=false, requires_approval=true, is_paid=false

**Indexes**:
- Primary key: `id`
- Unique: `code`
- Index: `is_active`, `sort_order`

#### 4. Leave Entitlement (leave_entitlements)

**Purpose**: Lịch sử tính toán leave entitlements

**Attributes**:
- `id` (PK): Unique identifier
- `employee_id` (FK): Reference to employees table
- `leave_type_id` (FK): Reference to cat_leave_types table
- `year` (INT): Năm của entitlement
- `entitlement_days` (DECIMAL(5,2)): Số ngày được cấp
- `calculation_basis` (TEXT): Cơ sở tính toán (contract type, tenure, position, etc.)
- `prorated` (BOOLEAN, default false): Có prorated không (cho employees join mid-year)
- `prorated_months` (INT, nullable): Số tháng prorated (nếu applicable)
- `carry_over_from_previous_year` (DECIMAL(5,2), default 0): Số ngày carry-over từ năm trước
- `calculated_at` (TIMESTAMP): Thời gian tính toán
- `calculated_by` (VARCHAR(50), default 'SYSTEM'): Người/system tính toán
- `notes` (TEXT, nullable): Ghi chú
- `created_at` (TIMESTAMP): Thời gian tạo

**Business Rules**:
- Mỗi employee có một entitlement record cho mỗi leave type mỗi năm
- Entitlement được tính toán tự động hoặc manual
- Entitlement history được maintain để audit

**Indexes**:
- Primary key: `id`
- Index: `employee_id`, `leave_type_id`, `year`, `calculated_at`

#### 5. Leave Configuration (leave_configurations) - Planned

**Purpose**: Cấu hình leave policies và rules

**Attributes**:
- `id` (PK): Unique identifier
- `config_key` (VARCHAR(100), unique): Key của configuration
- `config_value` (TEXT): Value của configuration (JSON format)
- `description` (TEXT, nullable): Mô tả
- `applies_to` (ENUM): GLOBAL, DEPARTMENT, POSITION, EMPLOYEE
- `department_id` (FK, nullable): Reference to departments table (nếu applies_to = DEPARTMENT)
- `position_id` (FK, nullable): Reference to positions table (nếu applies_to = POSITION)
- `employee_id` (FK, nullable): Reference to employees table (nếu applies_to = EMPLOYEE)
- `is_active` (BOOLEAN, default true): Có active không
- `created_at` (TIMESTAMP): Thời gian tạo
- `updated_at` (TIMESTAMP): Thời gian cập nhật

**Configuration Keys**:
- `standard_working_days_per_week`: Số ngày làm việc tiêu chuẩn mỗi tuần
- `annual_leave_entitlement_fulltime`: Entitlement cho Full-time employees
- `annual_leave_entitlement_parttime`: Entitlement cho Part-time employees
- `sick_leave_entitlement`: Entitlement cho Sick Leave
- `maternity_leave_days`: Số ngày Maternity Leave
- `paternity_leave_days`: Số ngày Paternity Leave
- `max_carry_over_days`: Số ngày carry-over tối đa
- `minimum_notice_period_days`: Số ngày thông báo tối thiểu trước khi nghỉ
- `max_consecutive_leave_days`: Số ngày nghỉ liên tiếp tối đa
- `blackout_dates`: Danh sách ngày không được nghỉ (JSON array)

**Indexes**:
- Primary key: `id`
- Unique: `config_key`
- Index: `applies_to`, `department_id`, `position_id`, `employee_id`

#### 6. Leave Request Edit History (leave_request_edit_history)

**Purpose**: Lịch sử chỉnh sửa leave requests

**Attributes**:
- `id` (PK): Unique identifier
- `leave_request_id` (FK): Reference to leave_requests table
- `field_name` (VARCHAR(100)): Tên field được edit
- `old_value` (TEXT, nullable): Giá trị cũ
- `new_value` (TEXT, nullable): Giá trị mới
- `edit_reason` (TEXT, nullable): Lý do chỉnh sửa
- `edited_by` (FK): Reference to users table
- `edited_at` (TIMESTAMP): Thời gian chỉnh sửa

**Business Rules**:
- Mỗi edit tạo một record trong history
- History được maintain để audit trail

**Indexes**:
- Primary key: `id`
- Index: `leave_request_id`, `edited_at`

---

## 🔗 Relationships

### Entity Relationships

1. **Employee → Leave Requests** (One-to-Many)
   - Một employee có thể có nhiều leave requests
   - Foreign key: `leave_requests.employee_id` → `employees.id`

2. **Employee → Leave Balances** (One-to-Many)
   - Một employee có nhiều leave balances (mỗi leave type mỗi năm)
   - Foreign key: `leave_balances.employee_id` → `employees.id`

3. **Leave Type → Leave Requests** (One-to-Many)
   - Một leave type có thể có nhiều leave requests
   - Foreign key: `leave_requests.leave_type_id` → `cat_leave_types.id`

4. **Leave Type → Leave Balances** (One-to-Many)
   - Một leave type có nhiều leave balances
   - Foreign key: `leave_balances.leave_type_id` → `cat_leave_types.id`

5. **Leave Request → Leave Request Edit History** (One-to-Many)
   - Một leave request có thể có nhiều edit history records
   - Foreign key: `leave_request_edit_history.leave_request_id` → `leave_requests.id`

6. **User → Leave Requests (Approver)** (One-to-Many)
   - Một user (manager) có thể approve nhiều leave requests
   - Foreign key: `leave_requests.approved_by` → `users.id`
   - Foreign key: `leave_requests.rejected_by` → `users.id`

7. **Employee → Leave Entitlements** (One-to-Many)
   - Một employee có nhiều leave entitlements (mỗi leave type mỗi năm)
   - Foreign key: `leave_entitlements.employee_id` → `employees.id`

---

## 📋 Data Validation Rules

### Leave Request Validation
1. `start_date` >= current_date (trừ trường hợp đặc biệt với HR approval)
2. `end_date` >= `start_date`
3. `leave_days` = (end_date - start_date) + 1 (trừ weekends/holidays)
4. Nếu `leave_type.has_balance = true`:
   - `leave_balances.remaining` >= `leave_days`
5. `status` phải là một trong: PENDING, APPROVED, REJECTED, CANCELLED
6. Nếu `status = REJECTED`: `rejection_reason` phải không rỗng (minimum 10 characters)
7. Nếu `status = APPROVED`: `approved_by` và `approved_at` phải có giá trị
8. Nếu `leave_type.requires_medical_certificate = true` và `leave_days > medical_certificate_threshold`:
   - `attached_documents` phải có medical certificate

### Leave Balance Validation
1. `remaining` = `entitlement` - `used` - `pending` (calculated, không được set manual)
2. `entitlement` >= 0
3. `used` >= 0
4. `pending` >= 0
5. `remaining` có thể âm (nếu approved vượt quá balance, cần HR review)
6. `carry_over` <= `leave_type.max_carry_over_days` (nếu applicable)

### Leave Type Validation
1. `code` phải unique
2. Nếu `has_balance = false`: `max_days_per_year` phải là NULL
3. Nếu `can_carry_over = true`: `max_carry_over_days` phải có giá trị
4. Nếu `gender_restriction` không NULL: Chỉ employees có gender matching mới được tạo request

---

## 🔄 Business Logic Requirements

### Leave Request Creation
1. Validate employee status = Active
2. Validate leave balance (nếu applicable)
3. Check overlap với existing approved/pending requests
4. Calculate leave days (trừ weekends/holidays)
5. Validate leave type restrictions (gender, max days, etc.)
6. Create leave request với status = PENDING
7. Send notification to Manager

### Leave Request Approval
1. Validate Manager có quyền approve (trong cùng department)
2. Validate Manager không approve own request
3. Validate leave balance (nếu applicable)
4. Check team coverage (nếu configured)
5. Update leave request status = APPROVED
6. Update leave balance (trừ used)
7. Create attendance records (nếu integrated)
8. Send notification to Employee

### Leave Request Rejection
1. Validate rejection reason không rỗng
2. Update leave request status = REJECTED
3. Leave balance không bị ảnh hưởng
4. Send notification to Employee với rejection reason

### Leave Request Edit
1. Validate leave request có thể edit (status, start_date)
2. Validate new values (tương tự như create)
3. Restore original leave balance
4. Recalculate new leave balance
5. Update leave request
6. Log edit history
7. Set status = PENDING (nếu previously approved)
8. Send notification to Manager

### Leave Request Cancel
1. Validate leave request có thể cancel (status, start_date)
2. Update leave request status = CANCELLED
3. Restore leave balance (nếu previously approved)
4. Update attendance records (nếu integrated)
5. Send notification to Manager

### Leave Entitlements Calculation
1. Load employee information (contract type, tenure, position)
2. Load leave policy configurations
3. Calculate entitlements for each leave type
4. Handle prorated entitlements (new employees)
5. Handle carry-over (from previous year)
6. Handle expiration (unused leave)
7. Update leave balances
8. Create entitlement history records
9. Send notifications (nếu new entitlements granted)

---

## 🔌 Integration Requirements

### Integration with Attendance Service
1. **When leave request approved**:
   - Call Attendance Service API to mark attendance records as LEAVE
   - Prevent check-in/check-out on leave days
2. **When leave request cancelled**:
   - Call Attendance Service API to remove LEAVE marks
   - Allow check-in/check-out again
3. **When leave request edited (dates changed)**:
   - Call Attendance Service API to update LEAVE marks
4. **Real-time sync**:
   - Leave status changes phải sync với attendance records immediately

### Integration with User Service
1. **Authentication**:
   - Validate employee authentication before allowing leave operations
2. **Authorization**:
   - Check permissions (CREATE_LEAVE_REQUEST, APPROVE_LEAVE_REQUEST, etc.)
3. **User information**:
   - Get employee information (name, department, position) from User Service

### Integration with Financial Service (Planned)
1. **Payroll calculation**:
   - Export leave data for payroll calculation
   - Include leave days, leave types, paid/unpaid status
2. **Leave salary calculation**:
   - Calculate salary during leave (for paid leave types)
   - Handle unpaid leave (no salary)

### Integration with Notification Service (Planned)
1. **Leave request notifications**:
   - Send notifications when leave request created, approved, rejected, edited, cancelled
2. **Reminder notifications**:
   - Send reminders before leave start date
   - Send reminders if leave request pending > X days
   - Send reminders if leave balance low
   - Send reminders if leave balance about to expire

---

## 📊 Reporting Requirements

### Employee Leave Reports
1. **Leave History Report**:
   - List all leave requests with dates, types, days, status
   - Filter by date range, leave type, status
   - Export to Excel/CSV
2. **Leave Balance Report**:
   - Current balance, used, pending, remaining by leave type
   - Visual indicators (green/yellow/red)
   - Export to Excel/CSV

### Manager Leave Reports
1. **Team Leave Report**:
   - Leave requests of team members
   - Pending requests count
   - Upcoming leave calendar
   - Coverage analysis
   - Export to Excel/CSV
2. **Leave Statistics Report**:
   - Leave utilization by leave type
   - Department comparison
   - Trends and patterns

### HR Manager Leave Reports
1. **Organization Leave Overview**:
   - Total employees, employees on leave, pending requests
   - Leave utilization statistics
   - Leave balance analysis
   - Unusual patterns detection
2. **Leave Forecast Report**:
   - Projected leave usage for upcoming months
   - Department-wise forecast
   - Coverage planning
3. **Leave Compliance Report**:
   - Leave policy compliance
   - Leave entitlement vs utilization
   - Leave approval/rejection rates

---

## 🔒 Security Requirements

1. **Access Control**:
   - Employees chỉ có thể xem/edit own leave requests
   - Managers chỉ có thể approve leave requests của employees trong department
   - HR Managers có thể xem/approve tất cả leave requests
2. **Data Privacy**:
   - Leave information chỉ visible to authorized users
   - Sensitive information (medical certificates) chỉ visible to Manager/HR Manager
3. **Audit Trail**:
   - Tất cả leave operations phải được log (create, approve, reject, edit, cancel)
   - Log phải include: user, timestamp, old values, new values, reason

---

## 📈 Performance Requirements

1. **Leave Balance Calculation**: < 1 second
2. **Leave Request Creation**: < 500ms
3. **Leave Request Approval**: < 500ms
4. **Leave History Loading**: < 2 seconds for 100 records
5. **Leave Calendar View**: < 3 seconds for 1 month
6. **Leave Report Generation**: < 5 seconds for monthly report

---

## 🔗 Related Documents

- [Feature: Leave Management](../product-owner/feature-leave-management.md)
- [Use Cases: Leave Management](./use-cases-leave-management.md)
- [Business Rules: HR Management](./business-rules-hr-management.md#br-hr-007-leave-management)
- [Epic: HR Management](../product-owner/epic-hr-management.md#feature-6-leave-management-nghỉ-phép)

---

**Last Updated**: November 2025  
**Next Review**: December 2025

