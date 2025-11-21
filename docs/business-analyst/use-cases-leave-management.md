# Use Cases - Leave Management (Nghỉ Phép)

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Feature**: FEAT-008-006 - Leave Management (Nghỉ Phép)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Business Analyst

Tài liệu này mô tả các Use Cases chi tiết cho tính năng Nghỉ Phép (Leave Management) của hệ thống DigiERP.

---

## 🎯 Actors

### Primary Actors
- **Employee**: Nhân viên tạo và quản lý yêu cầu nghỉ phép
- **Manager**: Quản lý phòng ban, phê duyệt yêu cầu nghỉ phép của nhân viên
- **HR Manager**: Quản lý HR, cấu hình leave types, xem báo cáo tổng quan
- **System**: Tự động tính toán leave entitlements và leave balance

### Secondary Actors
- **User Service**: Xác thực employee authentication
- **Attendance Service**: Tích hợp để đánh dấu ngày nghỉ trong attendance records
- **Financial Service**: Tích hợp với payroll (planned)
- **Notification Service**: Gửi thông báo về trạng thái nghỉ phép

---

## 📝 Use Cases

### UC-LEAVE-001: Create Leave Request

**Use Case ID**: UC-LEAVE-001  
**Related User Story**: US-008-006-001  
**Priority**: Critical  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có status = Active
- Employee có quyền CREATE_LEAVE_REQUEST

**Main Flow**:
1. Employee chọn "Create Leave Request" từ leave menu
2. Hệ thống hiển thị form tạo leave request và load current leave balance cho tất cả leave types
3. Hệ thống hiển thị leave balance summary với:
   - Current balance, used balance, remaining balance cho mỗi leave type
   - Visual indicators (green/yellow/red) cho balance status
4. Employee chọn leave type (Annual, Sick, Unpaid, Maternity, Paternity, Emergency, Other)
5. Employee nhập start date
6. Employee nhập end date
7. Hệ thống validate:
   - Start date >= current date (trừ trường hợp đặc biệt với HR approval)
   - End date >= start date
   - Employee status = Active
8. Hệ thống tính toán số ngày nghỉ:
   - Leave days = (end_date - start_date) + 1
   - Trừ weekends và holidays (theo company policy)
9. Hệ thống validate leave balance:
   - Nếu leave type có balance (Annual, Sick, Maternity, Paternity):
     - Kiểm tra remaining balance >= leave days requested
   - Nếu leave type không có balance (Unpaid, Emergency):
     - Không cần kiểm tra balance
10. Hệ thống kiểm tra overlap với existing leave requests:
    - Kiểm tra có leave request nào đã approved/pending trong khoảng thời gian này không
    - Nếu có overlap: Hiển thị cảnh báo và danh sách overlapping requests
11. Employee nhập reason/notes (optional nhưng recommended)
12. Employee upload supporting documents (optional, required nếu sick leave > 3 days)
13. Employee submit leave request
14. Hệ thống tạo leave request với:
    - employee_id
    - leave_type_id
    - start_date
    - end_date
    - leave_days (calculated)
    - reason
    - status = PENDING
    - created_at = current timestamp
15. Hệ thống gửi notification cho Manager
16. Hệ thống hiển thị thông báo "Leave request created successfully"

**Alternative Flows**:

**A1: Leave balance không đủ**
- 9a. Hệ thống phát hiện remaining balance < leave days requested
- 9b. Hệ thống hiển thị lỗi "Leave balance không đủ"
- 9c. Hệ thống hiển thị:
   - Current balance
   - Requested days
   - Shortage amount
- 9d. Employee có thể:
   - Giảm số ngày nghỉ
   - Chọn leave type khác (Unpaid)
   - Hủy request
- Nếu giảm số ngày: Quay lại bước 6
- Nếu chọn type khác: Quay lại bước 4
- Nếu hủy: Use case kết thúc

**A2: Overlap với existing leave requests**
- 10a. Hệ thống phát hiện overlap với approved/pending leave requests
- 10b. Hệ thống hiển thị cảnh báo "Overlap detected" với danh sách overlapping requests
- 10c. Hệ thống yêu cầu employee xác nhận
- 10d. Employee xác nhận hoặc hủy
- Nếu xác nhận: Quay lại bước 13 (tạo request nhưng có overlap)
- Nếu hủy: Quay lại bước 5 để chỉnh sửa dates

**A3: Start date trong quá khứ**
- 7a. Hệ thống phát hiện start_date < current_date
- 7b. Hệ thống hiển thị cảnh báo "Start date trong quá khứ"
- 7c. Hệ thống yêu cầu approval đặc biệt từ HR Manager
- 7d. Employee có thể:
   - Chọn "Request HR Approval" để gửi request đặc biệt
   - Hoặc chỉnh sửa start date
- Nếu request HR approval: Quay lại bước 13 với flag requires_hr_approval = true
- Nếu chỉnh sửa: Quay lại bước 5

**A4: Sick leave > 3 days không có medical certificate**
- 12a. Hệ thống phát hiện sick leave > 3 days nhưng chưa upload medical certificate
- 12b. Hệ thống hiển thị cảnh báo "Medical certificate required for sick leave > 3 days"
- 12c. Hệ thống yêu cầu employee upload medical certificate
- 12d. Employee upload medical certificate hoặc hủy
- Nếu upload: Quay lại bước 13
- Nếu hủy: Use case kết thúc

**A5: Leave type yêu cầu giới tính cụ thể**
- 4a. Employee chọn Maternity Leave nhưng là nam
- 4b. Hệ thống từ chối và hiển thị lỗi "Maternity Leave chỉ dành cho nữ"
- 4c. Employee chọn leave type khác
- Quay lại bước 4

- 4d. Employee chọn Paternity Leave nhưng là nữ
- 4e. Hệ thống từ chối và hiển thị lỗi "Paternity Leave chỉ dành cho nam"
- 4f. Employee chọn leave type khác
- Quay lại bước 4

**Postconditions**:
- Leave request được tạo với status = PENDING
- Notification được gửi cho Manager
- Leave balance chưa bị trừ (chỉ trừ khi approved)

---

### UC-LEAVE-002: View Leave Balance

**Use Case ID**: UC-LEAVE-002  
**Related User Story**: US-008-006-002  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có quyền VIEW_LEAVE_BALANCE

**Main Flow**:
1. Employee chọn "View Leave Balance" từ leave menu
2. Hệ thống load leave balance data cho employee
3. Hệ thống tính toán:
   - Current balance cho mỗi leave type
   - Used balance (từ approved leave requests)
   - Pending balance (từ pending leave requests)
   - Remaining balance = Current - Used - Pending
4. Hệ thống hiển thị leave balance summary với:
   - Leave type name
   - Current balance (entitlement)
   - Used balance
   - Pending balance
   - Remaining balance
   - Visual indicators:
     - Green: Remaining >= 5 days
     - Yellow: 1 <= Remaining < 5 days
     - Red: Remaining < 1 day
5. Hệ thống hiển thị leave balance breakdown:
   - Current year balance
   - Next year balance (nếu có carry-over)
   - Carry-over balance (nếu có)
6. Hệ thống hiển thị leave entitlements:
   - Total days granted per year by leave type
   - Accrual rate
   - Next accrual date
7. Hệ thống hiển thị leave balance expiration dates (nếu applicable)
8. Hệ thống hiển thị pending leave requests và impact:
   - List pending requests với dates và days
   - Projected balance after pending requests are approved
9. Hệ thống hiển thị leave history summary:
   - Total days taken this year
   - Total days approved
   - Total days rejected
   - By leave type

**Alternative Flows**:

**A1: Employee chưa có leave balance**
- 3a. Hệ thống phát hiện employee chưa có leave balance records
- 3b. Hệ thống tự động tạo leave balance records với default entitlements
- 3c. Hệ thống hiển thị thông báo "Leave balance đã được khởi tạo"
- Quay lại bước 4

**A2: Leave balance sắp hết hạn**
- 7a. Hệ thống phát hiện có leave balance sắp hết hạn (trong vòng 30 ngày)
- 7b. Hệ thống hiển thị cảnh báo "Leave balance sắp hết hạn"
- 7c. Hệ thống highlight leave types có balance sắp hết hạn
- Quay lại bước 8

**Postconditions**:
- Employee xem được leave balance đầy đủ
- Leave balance được hiển thị với visual indicators
- Pending requests impact được hiển thị

---

### UC-LEAVE-003: Approve Leave Request

**Use Case ID**: UC-LEAVE-003  
**Related User Story**: US-008-006-003  
**Priority**: Critical  
**Actor**: Manager

**Preconditions**:
- Manager đã login vào hệ thống
- Manager có quyền APPROVE_LEAVE_REQUEST
- Có leave requests pending approval trong department của Manager

**Main Flow**:
1. Manager chọn "Leave Requests" từ manager menu
2. Hệ thống load danh sách leave requests của employees trong department
3. Hệ thống hiển thị danh sách với:
   - Employee name
   - Leave type
   - Start date, End date
   - Number of days
   - Reason
   - Status (highlight pending requests)
   - Created date
4. Manager chọn một leave request để xem chi tiết
5. Hệ thống hiển thị leave request details:
   - Employee information
   - Leave type
   - Dates and number of days
   - Reason and notes
   - Attached documents (nếu có)
   - Current leave balance
   - Leave balance impact (sau khi approve)
   - Team calendar view (để check conflicts)
6. Manager xem team calendar để check conflicts:
   - Hệ thống hiển thị calendar với approved/pending leaves của team
   - Highlight dates của request hiện tại
   - Hiển thị conflicts (nếu có)
7. Manager quyết định approve
8. Manager nhập approval notes (optional)
9. Manager click "Approve"
10. Hệ thống validate:
    - Leave request status = PENDING
    - Manager có quyền approve (trong cùng department)
    - Leave request không phải của chính Manager
11. Hệ thống cập nhật leave request:
    - status = APPROVED
    - approved_by = manager user_id
    - approved_at = current timestamp
    - approval_notes = manager notes
12. Hệ thống cập nhật leave balance:
    - Nếu leave type có balance: Trừ leave days từ balance
    - Nếu leave type không có balance: Không trừ
13. Hệ thống tạo attendance records (nếu integrated):
    - Mark attendance as LEAVE cho các ngày trong leave period
14. Hệ thống gửi notification cho Employee
15. Hệ thống hiển thị thông báo "Leave request approved successfully"

**Alternative Flows**:

**A1: Reject Leave Request**
- 7a. Manager quyết định reject
- 7b. Manager nhập rejection reason (required)
- 7c. Manager click "Reject"
- 7d. Hệ thống validate rejection reason không rỗng
- 7e. Hệ thống cập nhật leave request:
    - status = REJECTED
    - rejected_by = manager user_id
    - rejected_at = current timestamp
    - rejection_reason = manager reason
- 7f. Hệ thống gửi notification cho Employee
- 7g. Hệ thống hiển thị thông báo "Leave request rejected"
- Use case kết thúc

**A2: Insufficient team coverage**
- 6a. Hệ thống phát hiện approving leave sẽ gây insufficient team coverage
    - (Số nhân viên on leave > threshold, configurable)
- 6b. Hệ thống hiển thị cảnh báo "Insufficient team coverage detected"
- 6c. Hệ thống hiển thị:
   - Số nhân viên sẽ on leave
   - Coverage percentage
   - Recommended action
- 6d. Manager có thể:
   - Approve anyway (với confirmation)
   - Reject
   - Defer decision
- Nếu approve anyway: Quay lại bước 8
- Nếu reject: Quay lại A1
- Nếu defer: Use case kết thúc (request vẫn pending)

**A3: Leave balance không đủ sau khi approve**
- 10a. Hệ thống phát hiện leave balance không đủ (có thể xảy ra nếu balance thay đổi sau khi request được tạo)
- 10b. Hệ thống từ chối approve và hiển thị lỗi
- 10c. Hệ thống đề xuất Manager reject request với reason "Insufficient leave balance"
- 10d. Manager có thể:
   - Reject với reason
   - Hoặc approve anyway (nếu có quyền override)
- Nếu reject: Quay lại A1
- Nếu approve anyway: Quay lại bước 11 (với negative balance, cần HR review)

**A4: Manager approve own leave request**
- 10a. Hệ thống phát hiện Manager đang approve leave request của chính mình
- 10b. Hệ thống từ chối và hiển thị lỗi "Cannot approve own leave request"
- 10c. Hệ thống đề xuất Manager chuyển request lên cấp trên hoặc HR Manager
- Use case kết thúc

**A5: Bulk Approval**
- 1a. Manager chọn "Bulk Approval" từ menu
- 1b. Hệ thống hiển thị danh sách pending requests với checkboxes
- 1c. Manager chọn multiple requests
- 1d. Manager click "Approve Selected"
- 1e. Hệ thống validate tất cả selected requests
- 1f. Hệ thống approve tất cả valid requests
- 1g. Hệ thống hiển thị summary: số requests approved, số requests failed
- Use case kết thúc

**Postconditions**:
- Leave request status = APPROVED hoặc REJECTED
- Leave balance được cập nhật (nếu approved)
- Notification được gửi cho Employee
- Attendance records được tạo (nếu integrated)

---

### UC-LEAVE-004: Reject Leave Request

**Use Case ID**: UC-LEAVE-004  
**Related User Story**: US-008-006-003  
**Priority**: Critical  
**Actor**: Manager

**Preconditions**:
- Manager đã login vào hệ thống
- Manager có quyền APPROVE_LEAVE_REQUEST
- Có leave request pending approval

**Main Flow**:
1. Manager chọn leave request để reject (từ UC-LEAVE-003 hoặc trực tiếp)
2. Manager nhập rejection reason (required)
3. Manager click "Reject"
4. Hệ thống validate:
   - Rejection reason không rỗng
   - Leave request status = PENDING
   - Manager có quyền reject
5. Hệ thống cập nhật leave request:
   - status = REJECTED
   - rejected_by = manager user_id
   - rejected_at = current timestamp
   - rejection_reason = manager reason
6. Hệ thống gửi notification cho Employee với rejection reason
7. Hệ thống hiển thị thông báo "Leave request rejected successfully"

**Alternative Flows**:

**A1: Rejection reason không đầy đủ**
- 4a. Hệ thống phát hiện rejection reason quá ngắn (< 10 characters)
- 4b. Hệ thống yêu cầu Manager nhập reason chi tiết hơn
- 4c. Manager nhập reason chi tiết
- Quay lại bước 3

**Postconditions**:
- Leave request status = REJECTED
- Notification được gửi cho Employee
- Leave balance không bị ảnh hưởng

---

### UC-LEAVE-005: Edit Leave Request

**Use Case ID**: UC-LEAVE-005  
**Related User Story**: US-008-006-004  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có leave request với status = PENDING hoặc APPROVED
- Leave request chưa được taken (start_date >= current_date)

**Main Flow**:
1. Employee chọn "My Leave Requests" từ leave menu
2. Hệ thống hiển thị danh sách leave requests của employee
3. Employee chọn leave request để edit
4. Hệ thống validate:
   - Leave request status = PENDING hoặc APPROVED
   - Start date >= current_date (chưa được taken)
5. Hệ thống hiển thị edit form với current values
6. Employee chỉnh sửa:
   - Leave dates (start_date, end_date)
   - Leave type
   - Reason/notes
   - Attached documents
7. Hệ thống validate edited values (tương tự như create request)
8. Hệ thống tính toán:
   - New leave days
   - Leave balance impact (nếu dates/type thay đổi)
9. Nếu leave request đã approved:
   - Hệ thống yêu cầu employee nhập edit reason (required)
   - Employee nhập edit reason
10. Employee submit edited request
11. Hệ thống restore original leave balance (nếu dates/type thay đổi):
    - Restore original leave days to balance
12. Hệ thống cập nhật leave request:
    - Update fields với new values
    - status = PENDING (nếu previously approved)
    - edit_reason = employee reason (nếu có)
    - updated_at = current timestamp
13. Hệ thống log edit history:
    - Old values
    - New values
    - Edit reason
    - Edit timestamp
14. Hệ thống gửi notification cho Manager
15. Hệ thống hiển thị thông báo "Leave request updated successfully"

**Alternative Flows**:

**A1: Leave request đã được taken**
- 4a. Hệ thống phát hiện start_date < current_date (leave đã được taken)
- 4b. Hệ thống từ chối edit và hiển thị lỗi "Cannot edit leave request that has already been taken"
- 4c. Hệ thống đề xuất Employee cancel request và tạo request mới (nếu cần)
- Use case kết thúc

**A2: Leave request status không cho phép edit**
- 4a. Hệ thống phát hiện status = REJECTED hoặc CANCELLED
- 4b. Hệ thống từ chối edit và hiển thị lỗi "Cannot edit rejected/cancelled leave request"
- Use case kết thúc

**A3: New leave balance không đủ**
- 8a. Hệ thống phát hiện new leave days > remaining balance
- 8b. Hệ thống hiển thị lỗi "New leave days exceed available balance"
- 8c. Employee có thể:
    - Giảm số ngày nghỉ
    - Chọn leave type khác
    - Hủy edit
- Nếu giảm số ngày: Quay lại bước 6
- Nếu chọn type khác: Quay lại bước 6
- Nếu hủy: Use case kết thúc

**Postconditions**:
- Leave request được cập nhật với new values
- Leave balance được restore và recalculate
- Status chuyển về PENDING (nếu previously approved)
- Edit history được log
- Notification được gửi cho Manager

---

### UC-LEAVE-006: Cancel Leave Request

**Use Case ID**: UC-LEAVE-006  
**Related User Story**: US-008-006-004  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có leave request với status = PENDING hoặc APPROVED
- Leave request chưa được taken (start_date >= current_date)

**Main Flow**:
1. Employee chọn "My Leave Requests" từ leave menu
2. Hệ thống hiển thị danh sách leave requests của employee
3. Employee chọn leave request để cancel
4. Hệ thống validate:
   - Leave request status = PENDING hoặc APPROVED
   - Start date >= current_date
5. Hệ thống hiển thị confirmation dialog với:
   - Leave request details
   - Impact on leave balance (nếu approved)
6. Employee xác nhận cancel
7. Hệ thống cập nhật leave request:
   - status = CANCELLED
   - cancelled_at = current timestamp
   - cancellation_reason = "Cancelled by employee" (default)
8. Nếu leave request đã approved:
   - Hệ thống restore leave balance:
     - Add back leave days to balance
9. Hệ thống update attendance records (nếu integrated):
   - Remove LEAVE marks for cancelled leave period
10. Hệ thống gửi notification cho Manager
11. Hệ thống hiển thị thông báo "Leave request cancelled successfully"

**Alternative Flows**:

**A1: Leave request đã được taken**
- 4a. Hệ thống phát hiện start_date < current_date
- 4b. Hệ thống từ chối cancel và hiển thị lỗi "Cannot cancel leave request that has already been taken"
- Use case kết thúc

**A2: Employee hủy cancel**
- 6a. Employee click "Cancel" trong confirmation dialog
- 6b. Use case kết thúc (không có thay đổi)

**Postconditions**:
- Leave request status = CANCELLED
- Leave balance được restore (nếu previously approved)
- Attendance records được update (nếu integrated)
- Notification được gửi cho Manager

---

### UC-LEAVE-007: Calculate Leave Entitlements

**Use Case ID**: UC-LEAVE-007  
**Related User Story**: US-008-006-005  
**Priority**: Critical  
**Actor**: System

**Preconditions**:
- System có thông tin employee: contract type, tenure, position level
- System có leave policy configurations

**Main Flow**:
1. System trigger calculation (scheduled job hoặc manual trigger)
2. System load all active employees
3. For each employee:
   a. System load employee information:
      - Contract type (Full-time, Part-time, Contract, Intern)
      - Tenure (years of service)
      - Position level
      - Department
   b. System load leave policy configurations
   c. System calculate entitlements for each leave type:
      - Annual Leave: Based on contract type and tenure
      - Sick Leave: Standard entitlement (configurable)
      - Maternity Leave: 6 months (for female employees)
      - Paternity Leave: 5-10 days (for male employees, configurable)
   d. System handle special cases:
      - New employees (mid-year join): Prorated entitlements
      - Contract changes: Recalculate entitlements
      - Long-serving employees: Special entitlements
   e. System calculate carry-over (if applicable):
      - Max 5 days for Annual Leave (configurable)
      - Expire unused leave that cannot be carried over
   f. System update leave balance:
      - Add new entitlements
      - Handle carry-over
      - Expire old entitlements
   g. System create leave entitlement history record
4. System send notifications to employees (if new entitlements granted)
5. System log calculation results

**Alternative Flows**:

**A1: Employee chưa có leave balance records**
- 3f. System phát hiện employee chưa có leave balance records
- 3g. System tự động tạo leave balance records với calculated entitlements
- Quay lại bước 3h

**A2: Prorated entitlements for new employees**
- 3d. System phát hiện employee join mid-year
- 3e. System calculate prorated entitlements:
    - Entitlement = (Full entitlement * Remaining months) / 12
- Quay lại bước 3f

**A3: Contract type change**
- 3d. System phát hiện employee contract type changed
- 3e. System recalculate entitlements based on new contract type
- 3f. System adjust leave balance accordingly
- Quay lại bước 3g

**A4: Leave carry-over calculation**
- 3e. System calculate carry-over:
    - Unused Annual Leave from previous year
    - Max carry-over = 5 days (configurable)
    - Expire excess leave
- 3f. System update leave balance with carry-over
- Quay lại bước 3g

**Postconditions**:
- Leave entitlements được tính toán và cập nhật
- Leave balance được update
- Leave entitlement history được tạo
- Notifications được gửi (nếu có)

---

### UC-LEAVE-008: View Leave History

**Use Case ID**: UC-LEAVE-008  
**Related User Story**: US-008-006-006  
**Priority**: Medium  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có quyền VIEW_LEAVE_HISTORY

**Main Flow**:
1. Employee chọn "Leave History" từ leave menu
2. Hệ thống load leave history cho employee
3. Hệ thống hiển thị danh sách leave requests với:
   - Leave type
   - Start date, End date
   - Number of days
   - Status (Pending, Approved, Rejected, Cancelled)
   - Approval/Rejection details (who, when, reason)
   - Created date
4. Employee có thể filter by:
   - Date range
   - Leave type
   - Status
5. Employee có thể sort by:
   - Date (newest/oldest)
   - Leave type
   - Status
6. Employee chọn một leave request để xem chi tiết
7. Hệ thống hiển thị leave request details:
   - All information
   - Approval/rejection history
   - Edit history (nếu có)
   - Attached documents
8. Hệ thống hiển thị summary statistics:
   - Total days taken (by leave type)
   - Total days approved
   - Total days rejected
   - Leave utilization trends (charts/graphs)
9. Employee có thể export to Excel/CSV

**Alternative Flows**:

**A1: No leave history**
- 3a. Hệ thống phát hiện employee chưa có leave history
- 3b. Hệ thống hiển thị message "No leave history found"
- Use case kết thúc

**A2: Export to Excel/CSV**
- 9a. Employee click "Export"
- 9b. Hệ thống generate Excel/CSV file với filtered data
- 9c. Hệ thống download file
- Use case kết thúc

**Postconditions**:
- Employee xem được leave history đầy đủ
- Summary statistics được hiển thị
- Export file được tạo (nếu requested)

---

### UC-LEAVE-009: Manager Leave Dashboard

**Use Case ID**: UC-LEAVE-009  
**Related User Story**: US-008-006-007  
**Priority**: High  
**Actor**: Manager

**Preconditions**:
- Manager đã login vào hệ thống
- Manager có quyền VIEW_TEAM_LEAVE

**Main Flow**:
1. Manager chọn "Team Leave Dashboard" từ manager menu
2. Hệ thống load leave data cho team (employees in Manager's department)
3. Hệ thống hiển thị dashboard với:
   - Pending leave requests count (highlight)
   - Upcoming leave (next 30/60/90 days)
   - Current leave status (who is on leave now)
   - Leave calendar view (all team leave)
4. Manager xem calendar view:
   - Approved leaves (green)
   - Pending leaves (yellow)
   - Rejected leaves (red, if shown)
5. Manager xem pending leave requests:
   - List of pending requests
   - Quick approve/reject actions
6. Manager xem leave statistics:
   - Total employees
   - Employees on leave
   - Employees returning soon
   - Leave statistics by leave type
7. Manager filter by:
   - Employee
   - Date range
   - Leave type
8. Manager xem coverage alerts:
   - Multiple employees on leave same dates
   - Insufficient coverage warnings
9. Manager export leave calendar (if needed)

**Alternative Flows**:

**A1: No pending requests**
- 3a. Hệ thống phát hiện không có pending requests
- 3b. Hệ thống hiển thị "No pending leave requests"
- Quay lại bước 4

**A2: Coverage conflict detected**
- 8a. Hệ thống phát hiện multiple employees request leave on same dates
- 8b. Hệ thống highlight conflicts trong calendar
- 8c. Hệ thống hiển thị alert "Coverage conflict detected"
- 8d. Manager có thể xem conflict details và take action
- Quay lại bước 5

**Postconditions**:
- Manager xem được team leave overview
- Pending requests được highlight
- Coverage conflicts được identified

---

### UC-LEAVE-010: HR Manager Leave Overview

**Use Case ID**: UC-LEAVE-010  
**Related User Story**: US-008-006-008  
**Priority**: High  
**Actor**: HR Manager

**Preconditions**:
- HR Manager đã login vào hệ thống
- HR Manager có quyền VIEW_ORG_LEAVE

**Main Flow**:
1. HR Manager chọn "Leave Overview" từ HR menu
2. Hệ thống load leave data cho toàn bộ organization
3. Hệ thống hiển thị overview dashboard với:
   - Total employees
   - Employees on leave (current)
   - Pending leave requests (organization-wide)
   - Leave utilization statistics
4. HR Manager xem leave reports:
   - By department
   - By position
   - By employee
   - By date range
5. HR Manager xem leave utilization statistics:
   - Average days taken per employee
   - Leave types distribution
   - Department comparison
   - Year over year comparison
6. HR Manager xem leave balance analysis:
   - Employees with low balance (< 3 days)
   - Employees with high balance (> 20 days)
   - Expired leave (if applicable)
7. HR Manager xem unusual patterns:
   - Frequent sick leave
   - Excessive annual leave usage
   - Leave policy violations
8. HR Manager generate leave forecast:
   - Projected leave usage for upcoming months
   - Department-wise forecast
9. HR Manager export reports:
   - Excel, PDF, CSV formats
   - Custom date ranges
   - Custom filters

**Alternative Flows**:

**A1: Generate custom report**
- 4a. HR Manager chọn "Generate Custom Report"
- 4b. HR Manager chọn filters:
    - Department(s)
    - Position(s)
    - Date range
    - Leave type(s)
    - Report type (Summary, Detailed, Analysis)
- 4c. HR Manager click "Generate"
- 4d. Hệ thống generate report
- 4e. HR Manager download report
- Use case kết thúc

**A2: Export to Excel/PDF**
- 9a. HR Manager chọn export format
- 9b. HR Manager click "Export"
- 9c. Hệ thống generate file
- 9d. HR Manager download file
- Use case kết thúc

**Postconditions**:
- HR Manager xem được organization-wide leave overview
- Reports được generate
- Analytics được hiển thị

---

### UC-LEAVE-011: Configure Leave Types

**Use Case ID**: UC-LEAVE-011  
**Related User Story**: US-008-006-009  
**Priority**: Medium  
**Actor**: HR Manager

**Preconditions**:
- HR Manager đã login vào hệ thống
- HR Manager có quyền CONFIGURE_LEAVE_TYPES

**Main Flow**:
1. HR Manager chọn "Leave Types Configuration" từ HR menu
2. Hệ thống hiển thị danh sách leave types hiện có
3. HR Manager chọn "Create New Leave Type" hoặc "Edit Existing"
4. HR Manager nhập leave type information:
   - Name
   - Code (unique)
   - Description
   - Max days per year
   - Carry-over rules (max days, expiration)
   - Requires approval (yes/no)
   - Requires medical certificate (if > X days)
   - Gender restriction (if applicable)
5. HR Manager configure leave entitlements:
   - By contract type (Full-time, Part-time, etc.)
   - By tenure (years of service)
   - By position level
6. HR Manager configure approval workflow:
   - Single-level (Manager only)
   - Multi-level (Manager → HR Manager)
7. HR Manager configure other rules:
   - Minimum notice period
   - Maximum consecutive days
   - Blackout dates
   - Accrual rules (monthly, quarterly, yearly)
8. HR Manager test configuration (optional)
9. HR Manager save configuration
10. Hệ thống validate configuration:
    - Max days >= 0
    - Carry-over <= max days
    - All required fields filled
11. Hệ thống save leave type configuration
12. Hệ thống maintain configuration history (audit trail)
13. Hệ thống hiển thị thông báo "Leave type configured successfully"

**Alternative Flows**:

**A1: Edit existing leave type**
- 3a. HR Manager chọn "Edit Existing"
- 3b. HR Manager chọn leave type để edit
- 3c. Hệ thống hiển thị current configuration
- 3d. HR Manager chỉnh sửa configuration
- Quay lại bước 8

**A2: Test configuration**
- 8a. HR Manager click "Test Configuration"
- 8b. Hệ thống validate configuration với sample data
- 8c. Hệ thống hiển thị test results
- 8d. HR Manager có thể adjust configuration
- Quay lại bước 8

**A3: Invalid configuration**
- 10a. Hệ thống phát hiện invalid configuration
- 10b. Hệ thống hiển thị lỗi và yêu cầu fix
- 10c. HR Manager fix errors
- Quay lại bước 9

**Postconditions**:
- Leave type configuration được save
- Configuration history được maintain
- System enforces new rules

---

### UC-LEAVE-012: Integration with Attendance System

**Use Case ID**: UC-LEAVE-012  
**Related User Story**: US-008-006-010  
**Priority**: High  
**Actor**: System

**Preconditions**:
- Leave request được approve
- Attendance system đã integrated

**Main Flow**:
1. System detect leave request status changed to APPROVED
2. System extract leave information:
   - Employee ID
   - Start date
   - End date
   - Leave type
3. System call Attendance Service API:
   - Mark attendance records as LEAVE for leave period
4. Attendance Service update attendance records:
   - For each day in leave period:
     - Create or update attendance record
     - Set type = LEAVE
     - Set status = APPROVED (automatically)
     - Link to leave request
5. System prevent check-in/check-out on leave days:
   - If employee attempts check-in on leave day:
     - System reject và hiển thị message "You are on leave today"
6. System sync leave status with attendance records in real-time
7. System log integration actions

**Alternative Flows**:

**A1: Leave request cancelled**
- 1a. System detect leave request status changed to CANCELLED
- 1b. System call Attendance Service to remove LEAVE marks
- 1c. Attendance Service update attendance records:
    - Remove LEAVE marks for cancelled period
    - Allow check-in/check-out again
- Use case kết thúc

**A2: Leave request edited**
- 1a. System detect leave request dates changed
- 1b. System call Attendance Service to update LEAVE marks
- 1c. Attendance Service update attendance records:
    - Remove old LEAVE marks
    - Add new LEAVE marks for new period
- Use case kết thúc

**A3: Attendance Service unavailable**
- 3a. System phát hiện Attendance Service không available
- 3b. System queue integration task for retry
- 3c. System retry sau một khoảng thời gian
- 3d. System log error nếu retry failed
- Use case kết thúc (với error logged)

**Postconditions**:
- Attendance records được mark as LEAVE
- Check-in/check-out bị prevent trên leave days
- Data consistency được maintain

---

### UC-LEAVE-013: Leave Request Notifications

**Use Case ID**: UC-LEAVE-013  
**Related User Story**: US-008-006-011  
**Priority**: Medium  
**Actor**: System

**Preconditions**:
- Notification Service available
- User notification preferences configured

**Main Flow**:
1. System detect leave request event (create, approve, reject, etc.)
2. System determine notification recipients:
   - Employee (for all events)
   - Manager (for create, edit, cancel)
   - HR Manager (for special cases)
3. System prepare notification content:
   - Event type
   - Leave request details
   - Action required (if any)
4. System send notifications:
   - Email notification
   - In-app notification
5. System log notification sent

**Alternative Flows**:

**A1: Leave request created**
- 1a. System detect leave request created
- 1b. System send notification to Manager:
    - Subject: "New Leave Request from [Employee Name]"
    - Content: Leave request details, dates, days
    - Action: Approve/Reject link
- Use case kết thúc

**A2: Leave request approved**
- 1a. System detect leave request approved
- 1b. System send notification to Employee:
    - Subject: "Leave Request Approved"
    - Content: Approved dates, leave balance updated
- Use case kết thúc

**A3: Leave request rejected**
- 1a. System detect leave request rejected
- 1b. System send notification to Employee:
    - Subject: "Leave Request Rejected"
    - Content: Rejection reason, dates
- Use case kết thúc

**A4: Leave balance low**
- 1a. System detect leave balance < 3 days
- 1b. System send reminder notification to Employee:
    - Subject: "Low Leave Balance Alert"
    - Content: Current balance, expiration dates
- Use case kết thúc

**A5: Leave about to expire**
- 1a. System detect leave balance about to expire (within 30 days)
- 1b. System send notification to Employee:
    - Subject: "Leave Balance Expiring Soon"
    - Content: Expiring balance, expiration date
- Use case kết thúc

**Postconditions**:
- Notifications được gửi đến recipients
- Notification logs được maintain

---

## 📊 Use Cases Summary

| Use Case ID | Use Case Name | Actor | Priority | Related User Story |
|-------------|---------------|-------|----------|-------------------|
| UC-LEAVE-001 | Create Leave Request | Employee | Critical | US-008-006-001 |
| UC-LEAVE-002 | View Leave Balance | Employee | High | US-008-006-002 |
| UC-LEAVE-003 | Approve Leave Request | Manager | Critical | US-008-006-003 |
| UC-LEAVE-004 | Reject Leave Request | Manager | Critical | US-008-006-003 |
| UC-LEAVE-005 | Edit Leave Request | Employee | High | US-008-006-004 |
| UC-LEAVE-006 | Cancel Leave Request | Employee | High | US-008-006-004 |
| UC-LEAVE-007 | Calculate Leave Entitlements | System | Critical | US-008-006-005 |
| UC-LEAVE-008 | View Leave History | Employee | Medium | US-008-006-006 |
| UC-LEAVE-009 | Manager Leave Dashboard | Manager | High | US-008-006-007 |
| UC-LEAVE-010 | HR Manager Leave Overview | HR Manager | High | US-008-006-008 |
| UC-LEAVE-011 | Configure Leave Types | HR Manager | Medium | US-008-006-009 |
| UC-LEAVE-012 | Integration with Attendance | System | High | US-008-006-010 |
| UC-LEAVE-013 | Leave Request Notifications | System | Medium | US-008-006-011 |

---

## 🔗 Related Documents

- [Feature: Leave Management](../product-owner/feature-leave-management.md)
- [Business Rules: HR Management](./business-rules-hr-management.md#br-hr-007-leave-management)
- [Epic: HR Management](../product-owner/epic-hr-management.md#feature-6-leave-management-nghỉ-phép)

---

**Last Updated**: November 2025  
**Next Review**: December 2025

