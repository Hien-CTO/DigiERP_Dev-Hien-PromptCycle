# Database Schema: Leave Management (Nghỉ Phép)

## 📋 Tổng Quan

**Module**: HR Management - Leave Management  
**Feature ID**: FEAT-008-006  
**Database**: `Hien_DigiERP_LeHuy_Dev2`  
**Version**: 1.0  
**Last Updated**: November 2025

Tài liệu này mô tả database schema cho tính năng Leave Management (Nghỉ Phép), bao gồm:
- Core tables cho leave requests và leave balance
- Leave entitlement tracking
- Multi-level approval workflow
- Audit trail và edit history

---

## 🗂️ Database Tables

### 1. leave_requests

**Mục đích**: Lưu trữ các yêu cầu nghỉ phép của nhân viên

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| request_number | VARCHAR(50) | NO | - | Số đơn nghỉ phép (UNIQUE) |
| employee_id | INT | NO | - | FK to employees.id |
| leave_type_id | INT | NO | - | FK to cat_leave_types.id |
| start_date | DATE | NO | - | Ngày bắt đầu nghỉ |
| end_date | DATE | NO | - | Ngày kết thúc nghỉ |
| total_days | DECIMAL(5,2) | NO | - | Tổng số ngày nghỉ |
| is_half_day | TINYINT(1) | NO | 0 | Nghỉ nửa ngày |
| half_day_type | ENUM | YES | NULL | MORNING, AFTERNOON |
| reason | TEXT | NO | - | Lý do nghỉ phép |
| approver_id | INT | YES | NULL | FK to employees.id - Manager phê duyệt |
| hr_approver_id | INT | YES | NULL | FK to employees.id - HR Manager phê duyệt |
| requires_hr_approval | TINYINT(1) | NO | 0 | Yêu cầu phê duyệt từ HR Manager |
| status | ENUM | NO | 'PENDING' | PENDING, APPROVED, REJECTED, CANCELLED |
| approved_at | TIMESTAMP | YES | NULL | Thời gian phê duyệt (deprecated, dùng manager_approved_at/hr_approved_at) |
| rejected_at | TIMESTAMP | YES | NULL | Thời gian từ chối |
| rejection_reason | TEXT | YES | NULL | Lý do từ chối (deprecated, dùng manager_rejection_reason/hr_rejection_reason) |
| manager_approved_at | TIMESTAMP | YES | NULL | Thời gian Manager phê duyệt |
| hr_approved_at | TIMESTAMP | YES | NULL | Thời gian HR Manager phê duyệt |
| manager_rejection_reason | TEXT | YES | NULL | Lý do Manager từ chối |
| hr_rejection_reason | TEXT | YES | NULL | Lý do HR Manager từ chối |
| manager_notes | TEXT | YES | NULL | Ghi chú từ Manager |
| hr_notes | TEXT | YES | NULL | Ghi chú từ HR Manager |
| attachment_url | TEXT | YES | NULL | Link file đính kèm (giấy tờ, chứng từ) |
| is_edited | TINYINT(1) | NO | 0 | Đã được chỉnh sửa |
| edited_at | TIMESTAMP | YES | NULL | Thời gian chỉnh sửa |
| edited_by | INT | YES | NULL | FK to users.id - Người chỉnh sửa |
| edit_reason | TEXT | YES | NULL | Lý do chỉnh sửa |
| cancellation_reason | TEXT | YES | NULL | Lý do hủy |
| cancelled_at | TIMESTAMP | YES | NULL | Thời gian hủy |
| cancelled_by | INT | YES | NULL | FK to users.id - Người hủy |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_request_number` (request_number) - UNIQUE
- `idx_employee_id` (employee_id)
- `idx_leave_type_id` (leave_type_id)
- `idx_start_date` (start_date)
- `idx_end_date` (end_date)
- `idx_status` (status)
- `idx_approver_id` (approver_id)
- `idx_hr_approver_id` (hr_approver_id)
- `idx_requires_hr_approval` (requires_hr_approval)
- `idx_is_edited` (is_edited)
- `idx_edited_by` (edited_by)

**Foreign Keys**:
- `employee_id` → `employees.id` (ON DELETE CASCADE)
- `leave_type_id` → `cat_leave_types.id` (ON DELETE RESTRICT)
- `approver_id` → `employees.id` (ON DELETE SET NULL)
- `hr_approver_id` → `employees.id` (ON DELETE SET NULL)
- `edited_by` → `users.id` (ON DELETE SET NULL)
- `cancelled_by` → `users.id` (ON DELETE SET NULL)

**Business Rules**:
- `end_date` phải >= `start_date`
- `total_days` được tính tự động dựa trên start_date, end_date, is_half_day
- Status workflow: PENDING → APPROVED/REJECTED → CANCELLED (nếu cần)
- Khi status = APPROVED, tự động cập nhật `leave_balances.used_days`
- Khi status = PENDING, tự động cập nhật `leave_balances.pending_days`
- Khi status = REJECTED/CANCELLED, tự động restore balance nếu đã được approve trước đó

---

### 2. leave_balances

**Mục đích**: Lưu trữ leave balance của nhân viên theo từng loại nghỉ và năm

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Unique Constraint**: `(employee_id, leave_type_id, year)`

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| employee_id | INT | NO | - | FK to employees.id |
| leave_type_id | INT | NO | - | FK to cat_leave_types.id |
| year | INT | NO | - | Năm (YYYY) |
| entitlement_days | DECIMAL(5,2) | NO | 0 | Số ngày được cấp phát (tổng entitlement) |
| used_days | DECIMAL(5,2) | NO | 0 | Số ngày đã sử dụng |
| remaining_days | DECIMAL(5,2) | NO | 0 | Số ngày còn lại (tự động tính) |
| carry_over_days | DECIMAL(5,2) | NO | 0 | Số ngày carry-over từ năm trước |
| expired_days | DECIMAL(5,2) | NO | 0 | Số ngày đã hết hạn (không được carry-over) |
| pending_days | DECIMAL(5,2) | NO | 0 | Số ngày đang pending (chưa được approve) |
| last_calculated_at | TIMESTAMP | YES | NULL | Thời gian tính toán cuối cùng |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_employee_id` (employee_id)
- `idx_leave_type_id` (leave_type_id)
- `idx_year` (year)
- `uk_employee_leave_type_year` (employee_id, leave_type_id, year) - UNIQUE

**Foreign Keys**:
- `employee_id` → `employees.id` (ON DELETE CASCADE)
- `leave_type_id` → `cat_leave_types.id` (ON DELETE RESTRICT)

**Business Rules**:
- Mỗi employee chỉ có 1 balance record per leave type per year
- `remaining_days = entitlement_days + carry_over_days - used_days - pending_days - expired_days`
- Tự động cập nhật khi:
  - Leave request được approve → tăng `used_days`, giảm `pending_days`
  - Leave request được reject/cancel → giảm `used_days` hoặc `pending_days`
  - Leave entitlement được grant → tăng `entitlement_days`
  - Leave expires → tăng `expired_days`, giảm `remaining_days`

---

### 3. leave_entitlements

**Mục đích**: Lưu trữ lịch sử cấp phát leave entitlements

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| employee_id | INT | NO | - | FK to employees.id |
| leave_type_id | INT | NO | - | FK to cat_leave_types.id |
| year | INT | NO | - | Năm (YYYY) |
| entitlement_days | DECIMAL(5,2) | NO | 0 | Số ngày được cấp phát |
| granted_date | DATE | NO | - | Ngày được cấp phát |
| expiration_date | DATE | YES | NULL | Ngày hết hạn (nếu có) |
| carry_over_days | DECIMAL(5,2) | NO | 0 | Số ngày được carry-over từ năm trước |
| calculation_basis | VARCHAR(100) | YES | NULL | Cơ sở tính toán: CONTRACT_TYPE, TENURE, POSITION, etc. |
| calculation_details | TEXT | YES | NULL | Chi tiết tính toán (JSON hoặc text) |
| is_prorated | TINYINT(1) | NO | 0 | Có phải prorated (nhân viên mới vào giữa năm) |
| prorated_from_date | DATE | YES | NULL | Ngày bắt đầu tính prorated |
| prorated_to_date | DATE | YES | NULL | Ngày kết thúc tính prorated |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_employee_id` (employee_id)
- `idx_leave_type_id` (leave_type_id)
- `idx_year` (year)
- `idx_granted_date` (granted_date)

**Foreign Keys**:
- `employee_id` → `employees.id` (ON DELETE CASCADE)
- `leave_type_id` → `cat_leave_types.id` (ON DELETE RESTRICT)

**Business Rules**:
- Mỗi entitlement record đại diện cho một lần cấp phát leave
- Khi grant entitlement, tự động tạo/cập nhật `leave_balances.entitlement_days`
- Prorated entitlements được tính cho nhân viên mới vào giữa năm
- Carry-over days được tính từ năm trước nếu có

---

### 4. leave_request_approvals

**Mục đích**: Lưu trữ lịch sử phê duyệt leave requests (multi-level approval workflow)

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| leave_request_id | INT | NO | - | FK to leave_requests.id |
| approval_level | ENUM | NO | - | MANAGER, HR_MANAGER |
| approver_id | INT | NO | - | FK to employees.id - Người phê duyệt |
| status | ENUM | NO | 'PENDING' | PENDING, APPROVED, REJECTED |
| approved_at | TIMESTAMP | YES | NULL | Thời gian phê duyệt |
| rejected_at | TIMESTAMP | YES | NULL | Thời gian từ chối |
| rejection_reason | TEXT | YES | NULL | Lý do từ chối |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian cập nhật |
| created_by | INT | YES | NULL | Người tạo |
| updated_by | INT | YES | NULL | Người cập nhật |

**Indexes**:
- `idx_leave_request_id` (leave_request_id)
- `idx_approval_level` (approval_level)
- `idx_approver_id` (approver_id)
- `idx_status` (status)

**Foreign Keys**:
- `leave_request_id` → `leave_requests.id` (ON DELETE CASCADE)
- `approver_id` → `employees.id` (ON DELETE RESTRICT)

**Business Rules**:
- Mỗi leave request có thể có nhiều approval records (1 cho Manager, 1 cho HR Manager)
- Approval workflow:
  - Single-level: Chỉ cần Manager approval
  - Multi-level: Manager approval → HR Manager approval
- Khi Manager approve, tạo record với `approval_level = MANAGER`, `status = APPROVED`
- Khi HR Manager approve, tạo record với `approval_level = HR_MANAGER`, `status = APPROVED`
- Khi reject, set `status = REJECTED`, `rejected_at = NOW()`, `rejection_reason` bắt buộc

---

### 5. leave_request_edit_history

**Mục đích**: Lưu trữ lịch sử chỉnh sửa leave requests (audit trail)

**Primary Key**: `id` (INT, AUTO_INCREMENT)

**Columns**:

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| leave_request_id | INT | NO | - | FK to leave_requests.id |
| edited_by | INT | NO | - | FK to users.id - Người chỉnh sửa |
| edited_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian chỉnh sửa |
| edit_reason | TEXT | YES | NULL | Lý do chỉnh sửa |
| old_values | JSON | YES | NULL | Giá trị cũ (JSON format) |
| new_values | JSON | YES | NULL | Giá trị mới (JSON format) |
| changed_fields | TEXT | YES | NULL | Danh sách các trường đã thay đổi |
| notes | TEXT | YES | NULL | Ghi chú |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Thời gian tạo |

**Indexes**:
- `idx_leave_request_id` (leave_request_id)
- `idx_edited_by` (edited_by)
- `idx_edited_at` (edited_at)

**Foreign Keys**:
- `leave_request_id` → `leave_requests.id` (ON DELETE CASCADE)
- `edited_by` → `users.id` (ON DELETE RESTRICT)

**Business Rules**:
- Mỗi lần edit leave request, tự động tạo record trong bảng này
- `old_values` và `new_values` lưu dưới dạng JSON để dễ query và hiển thị
- `changed_fields` lưu danh sách các trường đã thay đổi (comma-separated)
- Khi edit, tự động set `leave_requests.is_edited = 1`, `leave_requests.edited_at = NOW()`

---

## 🔗 Relationships Summary

### Core Relationships
1. **employees** → **leave_requests** (1:N) - Employee tạo leave requests
2. **employees** → **leave_balances** (1:N) - Employee có leave balances
3. **employees** → **leave_entitlements** (1:N) - Employee nhận entitlements
4. **cat_leave_types** → **leave_requests** (1:N) - Leave type được sử dụng trong requests
5. **cat_leave_types** → **leave_balances** (1:N) - Leave type có balances
6. **cat_leave_types** → **leave_entitlements** (1:N) - Leave type có entitlements

### Approval Relationships
7. **leave_requests** → **leave_request_approvals** (1:N) - Leave request có approval history
8. **employees** → **leave_request_approvals** (1:N) - Employee (Manager/HR) phê duyệt requests

### Audit Relationships
9. **leave_requests** → **leave_request_edit_history** (1:N) - Leave request có edit history
10. **users** → **leave_request_edit_history** (1:N) - User tạo edit history

---

## 📊 Indexes Strategy

### Performance Indexes
- **leave_requests**: Indexes trên employee_id, leave_type_id, start_date, end_date, status để tối ưu queries
- **leave_balances**: Unique index trên (employee_id, leave_type_id, year) để đảm bảo data integrity
- **leave_entitlements**: Indexes trên employee_id, leave_type_id, year, granted_date
- **leave_request_approvals**: Indexes trên leave_request_id, approval_level, status
- **leave_request_edit_history**: Indexes trên leave_request_id, edited_at

### Query Optimization
- Composite indexes cho các queries thường dùng:
  - `leave_requests(employee_id, status, start_date)` - Để query leave requests của employee
  - `leave_balances(employee_id, year)` - Để query balance của employee trong năm
  - `leave_entitlements(employee_id, leave_type_id, year)` - Để query entitlement

---

## 🔒 Constraints & Business Rules

### Data Integrity
1. **Unique Constraints**:
   - `leave_requests.request_number` - Đảm bảo mỗi request có số duy nhất
   - `leave_balances(employee_id, leave_type_id, year)` - Đảm bảo mỗi employee chỉ có 1 balance per type per year

2. **Check Constraints** (application level):
   - `end_date >= start_date` trong leave_requests
   - `remaining_days >= 0` trong leave_balances
   - `total_days > 0` trong leave_requests

3. **Foreign Key Constraints**:
   - CASCADE cho employee relationships (khi xóa employee, xóa các records liên quan)
   - RESTRICT cho leave type relationships (không cho phép xóa leave type đang được sử dụng)
   - SET NULL cho user relationships (khi xóa user, set NULL thay vì xóa records)

### Business Rules
1. **Leave Balance Calculation**:
   - Tự động tính `remaining_days` khi có thay đổi
   - Tự động cập nhật `used_days` khi leave request được approve
   - Tự động cập nhật `pending_days` khi leave request được tạo/cancel

2. **Approval Workflow**:
   - Single-level: Manager approval only
   - Multi-level: Manager → HR Manager (nếu `requires_hr_approval = 1`)

3. **Edit/Cancel Rules**:
   - Chỉ có thể edit/cancel khi status = PENDING hoặc APPROVED
   - Khi edit/cancel, tự động restore balance nếu đã được approve trước đó

---

## 📈 Performance Considerations

### Query Optimization
1. **Leave Balance Queries**: Sử dụng composite index (employee_id, leave_type_id, year)
2. **Leave History Queries**: Sử dụng indexes trên employee_id, start_date, end_date, status
3. **Approval Queries**: Sử dụng indexes trên leave_request_id, approval_level, status

### Data Volume
- **leave_requests**: Ước tính ~10,000-50,000 records/năm (tùy số lượng nhân viên)
- **leave_balances**: Ước tính ~1,000-5,000 records/năm (1 record per employee per leave type per year)
- **leave_entitlements**: Ước tính ~1,000-5,000 records/năm
- **leave_request_approvals**: Ước tính ~10,000-50,000 records/năm
- **leave_request_edit_history**: Ước tính ~1,000-5,000 records/năm

### Archiving Strategy
- Có thể archive các leave requests cũ (> 2 năm) sang archive table
- Giữ lại leave_balances và leave_entitlements để tính toán carry-over

---

**Last Updated**: November 2025  
**Version**: 1.0

