# Use Cases - Attendance Management (Chấm Công)

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Feature**: FEAT-008-005 - Attendance Management (Chấm Công)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Business Analyst

Tài liệu này mô tả các Use Cases chi tiết cho tính năng Chấm Công (Attendance Management) của hệ thống DigiERP.

---

## 🎯 Actors

### Primary Actors
- **Employee**: Nhân viên chấm công hàng ngày
- **Manager**: Quản lý phòng ban, phê duyệt attendance records
- **HR Manager**: Quản lý HR, monitor attendance patterns, configure rules
- **Payroll Specialist**: Xuất dữ liệu attendance cho payroll

### Secondary Actors
- **User Service**: Xác thực employee authentication
- **Financial Service**: Tích hợp với payroll (planned)
- **System**: Tự động tính toán giờ làm việc và overtime

---

## 📝 Use Cases

### UC-ATT-001: Employee Check-In

**Use Case ID**: UC-ATT-001  
**Related User Story**: US-008-005-001  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có status = Active
- Employee có quyền RECORD_ATTENDANCE
- Employee chưa check-in trong ngày hôm nay

**Main Flow**:
1. Employee chọn "Check-In" từ attendance menu
2. Hệ thống lấy current timestamp
3. Hệ thống lấy location (GPS coordinates hoặc address) nếu có
4. Hệ thống validate:
   - Employee chưa check-in trong ngày hôm nay
   - Current time >= 6:00 AM (configurable)
   - Employee status = Active
5. Hệ thống tạo attendance record với:
   - employee_id
   - attendance_date = current date
   - check_in_time = current timestamp
   - location = GPS/address (if available)
   - status = CHECKED_IN
   - type = NORMAL (default)
6. Hệ thống kiểm tra check-in time:
   - Nếu check-in > late_threshold (default: 9:00 AM): Đánh dấu late = true
   - Tính late_minutes = check_in_time - late_threshold
7. Hệ thống hiển thị thông báo "Check-in successful"
8. Hệ thống hiển thị check-in time và status (Normal/Late)

**Alternative Flows**:

**A1: Check-in quá muộn (Late)**
- 6a. Hệ thống phát hiện check-in > late_threshold
- 6b. Hệ thống đánh dấu late = true, late_minutes = check_in_time - late_threshold
- 6c. Hệ thống yêu cầu employee nhập lý do (optional)
- 6d. Employee nhập lý do (hoặc bỏ qua)
- 6e. Hệ thống lưu late_reason
- Quay lại bước 7

**A2: Check-in đã tồn tại**
- 4a. Hệ thống phát hiện employee đã check-in trong ngày hôm nay
- 4b. Hệ thống hiển thị lỗi "Bạn đã check-in hôm nay rồi"
- 4c. Hệ thống hiển thị thông tin check-in hiện tại
- Use case kết thúc

**A3: Check-in quá sớm**
- 4a. Hệ thống phát hiện current time < 6:00 AM
- 4b. Hệ thống hiển thị cảnh báo "Bạn đang check-in quá sớm"
- 4c. Hệ thống yêu cầu xác nhận
- 4d. Employee xác nhận hoặc hủy
- Nếu xác nhận: Quay lại bước 5
- Nếu hủy: Use case kết thúc

**A4: Employee không active**
- 4a. Hệ thống phát hiện employee status != Active
- 4b. Hệ thống từ chối check-in và hiển thị lỗi
- Use case kết thúc

**Postconditions**:
- Attendance record được tạo với status = CHECKED_IN
- Check-in time được ghi nhận
- Location được lưu (nếu có)
- Late status được đánh dấu (nếu applicable)

---

### UC-ATT-002: Employee Check-Out

**Use Case ID**: UC-ATT-002  
**Related User Story**: US-008-005-001  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee đã check-in trong ngày hôm nay
- Employee chưa check-out
- Attendance record có status = CHECKED_IN

**Main Flow**:
1. Employee chọn "Check-Out" từ attendance menu
2. Hệ thống lấy current timestamp
3. Hệ thống lấy location (GPS coordinates hoặc address) nếu có
4. Hệ thống validate:
   - Employee đã check-in trong ngày hôm nay
   - Employee chưa check-out
   - Check-out time > check-in time
5. Hệ thống cập nhật attendance record:
   - check_out_time = current timestamp
   - location (update nếu khác với check-in location)
6. Hệ thống tính toán:
   - working_hours = (check_out_time - check_in_time) - break_time
   - overtime_hours = working_hours - standard_working_hours (nếu > 0)
   - early_leave = true nếu check_out_time < early_leave_threshold (default: 5:00 PM)
   - early_leave_minutes = early_leave_threshold - check_out_time (nếu early_leave = true)
7. Hệ thống cập nhật status:
   - Nếu có early_leave hoặc late: status = PENDING_APPROVAL
   - Nếu không: status = COMPLETED
8. Hệ thống hiển thị thông báo "Check-out successful" với:
   - Working hours
   - Overtime hours (nếu có)
   - Status (Completed/Pending Approval)

**Alternative Flows**:

**A1: Check-out quá sớm (Early Leave)**
- 6a. Hệ thống phát hiện check-out < early_leave_threshold
- 6b. Hệ thống đánh dấu early_leave = true
- 6c. Hệ thống yêu cầu employee nhập lý do
- 6d. Employee nhập lý do
- 6e. Hệ thống lưu early_leave_reason
- 6f. Hệ thống set status = PENDING_APPROVAL
- Quay lại bước 8

**A2: Chưa check-in**
- 4a. Hệ thống phát hiện employee chưa check-in trong ngày hôm nay
- 4b. Hệ thống hiển thị lỗi "Bạn chưa check-in hôm nay"
- 4c. Hệ thống hỏi có muốn check-in trước không
- 4d. Nếu có: Chuyển sang UC-ATT-001
- 4e. Nếu không: Use case kết thúc

**A3: Check-out time < check-in time**
- 4a. Hệ thống phát hiện check-out time < check-in time
- 4b. Hệ thống từ chối và hiển thị lỗi "Thời gian check-out phải sau check-in"
- Use case kết thúc

**A4: Đã check-out rồi**
- 4a. Hệ thống phát hiện employee đã check-out
- 4b. Hệ thống hiển thị thông tin check-out hiện tại
- Use case kết thúc

**Postconditions**:
- Attendance record được cập nhật với check-out time
- Working hours và overtime hours được tính toán
- Status được set (COMPLETED hoặc PENDING_APPROVAL)
- Early leave được đánh dấu (nếu applicable)

---

### UC-ATT-003: View Attendance History

**Use Case ID**: UC-ATT-003  
**Related User Story**: US-008-005-002  
**Priority**: Medium  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có quyền VIEW_OWN_ATTENDANCE

**Main Flow**:
1. Employee chọn "My Attendance" từ menu
2. Hệ thống hiển thị danh sách attendance records của employee
3. Hệ thống hiển thị thông tin cho mỗi record:
   - Date
   - Check-in time
   - Check-out time
   - Working hours
   - Overtime hours
   - Status (Normal, Late, Early Leave, Overtime)
   - Approval status (Pending, Approved, Rejected)
4. Employee có thể filter theo:
   - Date range
   - Status
   - Approval status
5. Employee có thể xem chi tiết một record:
   - Click vào record
   - Hệ thống hiển thị full details:
     - Location (check-in/check-out)
     - Late minutes (nếu có)
     - Early leave minutes (nếu có)
     - Notes/Reasons
     - Approval history

**Alternative Flows**:

**A1: Không có attendance records**
- 2a. Hệ thống không tìm thấy attendance records
- 2b. Hệ thống hiển thị message "Chưa có bản ghi chấm công"
- Use case kết thúc

**A2: Filter không có kết quả**
- 4a. Employee apply filter
- 4b. Hệ thống không tìm thấy records match filter
- 4c. Hệ thống hiển thị message "Không tìm thấy kết quả"
- Employee có thể thay đổi filter

**Postconditions**:
- Employee xem được attendance history
- Employee có thể filter và xem chi tiết

---

### UC-ATT-004: Edit Attendance Record

**Use Case ID**: UC-ATT-004  
**Related User Story**: US-008-005-003  
**Priority**: Medium  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có quyền EDIT_OWN_ATTENDANCE
- Attendance record tồn tại và thuộc về employee
- Attendance record được tạo trong vòng 24 giờ (hoặc có manager approval)

**Main Flow**:
1. Employee chọn "My Attendance" và chọn record cần edit
2. Hệ thống kiểm tra:
   - Record thuộc về employee
   - Record được tạo trong vòng 24 giờ
3. Employee chọn "Edit"
4. Hệ thống hiển thị form edit với:
   - Check-in time (editable)
   - Check-out time (editable)
   - Reason for edit (required)
5. Employee chỉnh sửa thông tin và nhập lý do
6. Employee chọn "Save"
7. Hệ thống validate:
   - Check-out time > check-in time
   - Times hợp lệ
8. Hệ thống cập nhật attendance record:
   - Cập nhật check-in/check-out times
   - Lưu edit_reason
   - Set status = PENDING_APPROVAL
   - Tạo audit log entry
9. Hệ thống tính toán lại:
   - Working hours
   - Overtime hours
   - Late/Early leave status
10. Hệ thống hiển thị thông báo "Attendance record đã được cập nhật, đang chờ phê duyệt"

**Alternative Flows**:

**A1: Record quá 24 giờ**
- 2a. Hệ thống phát hiện record > 24 giờ
- 2b. Hệ thống từ chối edit và hiển thị message "Chỉ có thể chỉnh sửa trong vòng 24 giờ"
- 2c. Hệ thống gợi ý yêu cầu manager approval
- Use case kết thúc

**A2: Invalid times**
- 7a. Hệ thống phát hiện check-out time <= check-in time
- 7b. Hệ thống hiển thị lỗi "Check-out time phải sau check-in time"
- Quay lại bước 5

**A3: Record đã được approve**
- 2a. Hệ thống phát hiện record đã được approve
- 2b. Hệ thống từ chối edit và hiển thị message "Không thể chỉnh sửa record đã được phê duyệt"
- Use case kết thúc

**Postconditions**:
- Attendance record được cập nhật
- Status = PENDING_APPROVAL
- Edit history được lưu trong audit log
- Manager được notify để approve

---

### UC-ATT-005: Approve/Reject Attendance Record

**Use Case ID**: UC-ATT-005  
**Related User Story**: US-008-005-004  
**Priority**: High  
**Actor**: Manager, HR Manager

**Preconditions**:
- Manager/HR Manager đã login vào hệ thống
- Actor có quyền APPROVE_ATTENDANCE
- Có attendance records pending approval trong department của manager

**Main Flow - Approve**:
1. Manager chọn "Attendance Approval" từ menu
2. Hệ thống hiển thị danh sách attendance records pending approval:
   - Employee name
   - Date
   - Check-in/check-out times
   - Working hours, overtime
   - Late/Early leave status
   - Edit reason (nếu có)
3. Manager chọn record để approve
4. Manager xem chi tiết record
5. Manager chọn "Approve"
6. Hệ thống cập nhật attendance record:
   - approval_status = APPROVED
   - approved_by = manager user_id
   - approved_at = current timestamp
7. Hệ thống gửi notification cho employee
8. Hệ thống hiển thị thông báo "Attendance record đã được phê duyệt"

**Main Flow - Reject**:
1-4. Tương tự như Approve flow
5. Manager chọn "Reject"
6. Hệ thống yêu cầu nhập rejection reason (required)
7. Manager nhập rejection reason
8. Manager chọn "Confirm Reject"
9. Hệ thống cập nhật attendance record:
   - approval_status = REJECTED
   - rejected_by = manager user_id
   - rejected_at = current timestamp
   - rejection_reason = reason entered
10. Hệ thống gửi notification cho employee với rejection reason
11. Hệ thống hiển thị thông báo "Attendance record đã bị từ chối"

**Alternative Flows**:

**A1: Bulk Approval**
- 2a. Manager chọn multiple records
- 2b. Manager chọn "Bulk Approve"
- 2c. Hệ thống yêu cầu xác nhận
- 2d. Manager xác nhận
- 2e. Hệ thống approve tất cả selected records
- 2f. Hệ thống gửi notifications cho tất cả employees
- 2g. Hệ thống hiển thị thông báo "Đã phê duyệt X records"

**A2: Không có records pending**
- 2a. Hệ thống không tìm thấy records pending approval
- 2b. Hệ thống hiển thị message "Không có attendance records cần phê duyệt"
- Use case kết thúc

**A3: Record đã được approve/reject**
- 3a. Manager chọn record đã được approve/reject
- 3b. Hệ thống hiển thị thông tin approval/rejection hiện tại
- 3c. Manager không thể thay đổi decision
- Use case kết thúc

**Postconditions**:
- Attendance record được approve hoặc reject
- Employee nhận được notification
- Record có thể được sử dụng cho payroll (nếu approved)

---

### UC-ATT-006: View Attendance Dashboard and Reports

**Use Case ID**: UC-ATT-006  
**Related User Story**: US-008-005-005  
**Priority**: Medium  
**Actor**: HR Manager

**Preconditions**:
- HR Manager đã login vào hệ thống
- HR Manager có quyền VIEW_ATTENDANCE_REPORTS

**Main Flow**:
1. HR Manager chọn "Attendance Dashboard" từ menu
2. Hệ thống hiển thị attendance dashboard với:
   - Total employees
   - Employees checked in today
   - Pending approvals count
   - Late check-ins today
   - Early check-outs today
3. HR Manager có thể xem statistics:
   - Attendance rate (by day/week/month)
   - Late check-in trends
   - Early leave trends
   - Overtime statistics
4. HR Manager chọn "Generate Report"
5. Hệ thống hiển thị report options:
   - Date range
   - Department filter
   - Employee filter
   - Report type (Summary, Detailed, Late/Early Analysis)
6. HR Manager chọn options và "Generate"
7. Hệ thống generate report với:
   - Attendance summary
   - Late/Early statistics
   - Overtime summary
   - Department comparison
8. HR Manager có thể export report (Excel, PDF, CSV)

**Alternative Flows**:

**A1: Filter không có data**
- 6a. HR Manager apply filter
- 6b. Hệ thống không tìm thấy data match filter
- 6c. Hệ thống hiển thị message "Không có dữ liệu trong khoảng thời gian này"
- HR Manager có thể thay đổi filter

**A2: Unusual patterns detected**
- 2a. Hệ thống phát hiện unusual attendance patterns
- 2b. Hệ thống hiển thị alert trên dashboard
- 2c. HR Manager có thể click để xem chi tiết

**Postconditions**:
- HR Manager xem được attendance dashboard
- HR Manager có thể generate và export reports

---

### UC-ATT-007: Export Attendance Data for Payroll

**Use Case ID**: UC-ATT-007  
**Related User Story**: US-008-005-007  
**Priority**: High  
**Actor**: Payroll Specialist

**Preconditions**:
- Payroll Specialist đã login vào hệ thống
- Payroll Specialist có quyền EXPORT_ATTENDANCE_DATA

**Main Flow**:
1. Payroll Specialist chọn "Export Attendance Data" từ menu
2. Hệ thống hiển thị export form với:
   - Date range (required)
   - Department filter (optional)
   - Employee filter (optional)
   - Format selection (Excel, CSV, JSON)
   - Include only approved records (default: true)
3. Payroll Specialist chọn options
4. Payroll Specialist chọn "Export"
5. Hệ thống validate:
   - Date range hợp lệ
   - Có approved attendance records trong range
6. Hệ thống generate export file với columns:
   - Employee ID
   - Employee Name
   - Date
   - Check-in Time
   - Check-out Time
   - Working Hours
   - Overtime Hours
   - Late Minutes
   - Early Leave Minutes
   - Approval Status
7. Hệ thống download file cho Payroll Specialist
8. Hệ thống log export action trong audit trail

**Alternative Flows**:

**A1: Không có approved records**
- 5a. Hệ thống không tìm thấy approved records trong range
- 5b. Hệ thống hiển thị warning "Không có approved attendance records"
- 5c. Hệ thống hỏi có muốn export pending records không
- 5d. Nếu có: Export pending records với note
- 5e. Nếu không: Use case kết thúc

**A2: Date range quá lớn**
- 5a. Hệ thống phát hiện date range > 3 months
- 5b. Hệ thống hiển thị warning "Date range quá lớn, có thể mất nhiều thời gian"
- 5c. Hệ thống yêu cầu xác nhận
- 5d. Payroll Specialist xác nhận hoặc điều chỉnh range

**Postconditions**:
- Export file được generate và download
- Export action được log trong audit trail

---

### UC-ATT-008: Configure Attendance Rules and Policies

**Use Case ID**: UC-ATT-008  
**Related User Story**: US-008-005-008  
**Priority**: Medium  
**Actor**: HR Manager

**Preconditions**:
- HR Manager đã login vào hệ thống
- HR Manager có quyền CONFIGURE_ATTENDANCE_RULES

**Main Flow**:
1. HR Manager chọn "Attendance Configuration" từ menu
2. Hệ thống hiển thị configuration form với các settings:
   - Standard working hours per day (default: 8)
   - Break time (default: 1 hour)
   - Late threshold (default: 9:00 AM)
   - Early leave threshold (default: 5:00 PM)
   - Overtime calculation rules
   - Weekend attendance rules
   - Holiday attendance rules
3. HR Manager chỉnh sửa các settings
4. HR Manager có thể set different rules cho:
   - Different departments
   - Different positions
5. HR Manager chọn "Save Configuration"
6. Hệ thống validate settings
7. Hệ thống lưu configuration
8. Hệ thống hiển thị thông báo "Configuration đã được lưu"

**Alternative Flows**:

**A1: Invalid configuration**
- 6a. Hệ thống phát hiện invalid settings (ví dụ: working hours < 0)
- 6b. Hệ thống hiển thị lỗi và yêu cầu sửa
- Quay lại bước 3

**A2: Department/Position specific rules**
- 4a. HR Manager chọn "Set Department Rules"
- 4b. Hệ thống hiển thị list departments
- 4c. HR Manager chọn department và set rules
- 4d. Hệ thống lưu department-specific rules
- Quay lại bước 2

**Postconditions**:
- Attendance rules được cập nhật
- Rules được apply cho attendance calculations
- Rules có thể department/position specific

---

## 📊 Use Case Summary

| Use Case ID | Use Case Name | Actor | Priority | Status |
|------------|---------------|-------|----------|--------|
| UC-ATT-001 | Employee Check-In | Employee | High | Active |
| UC-ATT-002 | Employee Check-Out | Employee | High | Active |
| UC-ATT-003 | View Attendance History | Employee | Medium | Active |
| UC-ATT-004 | Edit Attendance Record | Employee | Medium | Active |
| UC-ATT-005 | Approve/Reject Attendance | Manager/HR Manager | High | Active |
| UC-ATT-006 | View Attendance Dashboard | HR Manager | Medium | Active |
| UC-ATT-007 | Export Attendance Data | Payroll Specialist | High | Active |
| UC-ATT-008 | Configure Attendance Rules | HR Manager | Medium | Active |

---

## 🔗 Traceability

**Related User Stories**:
- US-008-005-001 → UC-ATT-001, UC-ATT-002
- US-008-005-002 → UC-ATT-003
- US-008-005-003 → UC-ATT-004
- US-008-005-004 → UC-ATT-005
- US-008-005-005 → UC-ATT-006
- US-008-005-006 → UC-ATT-001, UC-ATT-002 (System calculation)
- US-008-005-007 → UC-ATT-007
- US-008-005-008 → UC-ATT-008

**Related Business Rules**:
- BR-ATT-001: Attendance Recording Rules
- BR-ATT-002: Working Hours Calculation
- BR-ATT-003: Overtime Calculation
- BR-ATT-004: Late/Early Leave Tracking
- BR-ATT-005: Attendance Approval Workflow
- BR-ATT-006: Attendance Edit Rules

---

**Last Updated**: November 2025  
**Next Review**: December 2025

