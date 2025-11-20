# Use Cases - HR Management

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Business Analyst

Tài liệu này mô tả các Use Cases chi tiết cho module Quản Lý Nhân Sự (HR Management) của hệ thống DigiERP.

---

## 🎯 Actors

### Primary Actors
- **HR Manager**: Quản lý toàn bộ hoạt động HR
- **HR Staff**: Nhân viên HR thực hiện các tác vụ hàng ngày
- **Employee**: Nhân viên sử dụng hệ thống
- **Manager**: Quản lý phòng ban, approve requests
- **System Administrator**: Quản lý hệ thống và cấu hình

### Secondary Actors
- **User Service**: Hệ thống xác thực và phân quyền
- **Financial Service**: Tích hợp với payroll (planned)

---

## 📝 Use Cases

### UC-HR-001: Create Employee

**Use Case ID**: UC-HR-001  
**Priority**: Critical  
**Actor**: HR Manager, HR Staff

**Preconditions**:
- Actor đã login vào hệ thống
- Actor có quyền CREATE_EMPLOYEE
- Department và Position đã được tạo trong hệ thống

**Main Flow**:
1. Actor chọn "Create New Employee"
2. Hệ thống hiển thị form tạo nhân viên
3. Actor nhập thông tin bắt buộc:
   - Full name
   - Date of birth
   - ID number (CMND/CCCD)
   - Email
   - Phone
   - Address
   - Department
   - Position
4. Actor có thể nhập thông tin tùy chọn:
   - Photo
   - Emergency contact
   - Bank account
   - Tax information
5. Actor chọn "Create Employee"
6. Hệ thống validate thông tin:
   - Check email uniqueness
   - Check ID number uniqueness
   - Validate email format
   - Validate phone format
7. Hệ thống tạo employee record
8. Hệ thống tự động generate employee_code
9. Hệ thống hiển thị thông báo thành công và employee code

**Alternative Flows**:

**A1: Email đã tồn tại**
- 6a. Hệ thống phát hiện email đã tồn tại
- 6b. Hệ thống hiển thị cảnh báo và yêu cầu xác nhận
- 6c. Actor xác nhận hoặc thay đổi email
- Quay lại bước 5

**A2: ID number đã tồn tại**
- 6a. Hệ thống phát hiện ID number đã tồn tại
- 6b. Hệ thống từ chối tạo nhân viên và hiển thị lỗi
- Use case kết thúc

**Postconditions**:
- Employee record được tạo trong hệ thống
- Employee có status = Active
- Employee được gán vào department và position

---

### UC-HR-002: Link Employee to User Account

**Use Case ID**: UC-HR-002  
**Priority**: Critical  
**Actor**: HR Manager, System Administrator

**Preconditions**:
- Employee đã được tạo trong hệ thống
- User account đã được tạo trong User Service (hoặc sẽ được tạo tự động)
- Actor có quyền LINK_EMPLOYEE_USER

**Main Flow**:
1. Actor chọn employee cần link
2. Hệ thống hiển thị thông tin employee
3. Actor chọn "Link User Account"
4. Hệ thống hiển thị 2 options:
   - Link to existing user account
   - Create new user account
5. Actor chọn option:
   
   **Option A: Link to existing user**
   5a. Hệ thống hiển thị danh sách user accounts chưa được link
   5b. Actor chọn user account
   5c. Hệ thống validate:
      - User account chưa được link với employee khác
      - User account status = Active
   5d. Hệ thống link employee với user account
   
   **Option B: Create new user account**
   5a. Hệ thống hiển thị form tạo user account
   5b. Actor nhập username và password
   5c. Hệ thống tạo user account trong User Service
   5d. Hệ thống link employee với user account mới tạo
6. Hệ thống sync employee status với user account status
7. Hệ thống hiển thị thông báo thành công

**Alternative Flows**:

**A1: User account đã được link**
- 5c. Hệ thống phát hiện user account đã được link
- 5d. Hệ thống từ chối và hiển thị lỗi
- Use case kết thúc

**A2: Employee đã có user account**
- 3a. Hệ thống phát hiện employee đã có user account
- 3b. Hệ thống hiển thị thông tin user account hiện tại
- 3c. Actor có thể chọn "Change User Account" (cần approval)
- Use case kết thúc hoặc tiếp tục với approval

**Postconditions**:
- Employee được link với user account
- User account có thể login với employee information
- Employee status được sync với user account status

---

### UC-HR-003: Assign Role to Employee

**Use Case ID**: UC-HR-003  
**Priority**: Critical  
**Actor**: HR Manager, System Administrator

**Preconditions**:
- Employee đã được link với user account
- Roles đã được định nghĩa trong hệ thống
- Actor có quyền ASSIGN_ROLE

**Main Flow**:
1. Actor chọn employee cần assign role
2. Hệ thống hiển thị thông tin employee và user account
3. Actor chọn "Assign Role"
4. Hệ thống hiển thị danh sách roles available
5. Hệ thống highlight default roles dựa trên position và department
6. Actor chọn role(s) cần assign
7. Hệ thống validate:
   - Role tồn tại trong hệ thống
   - Role phù hợp với position (có thể override)
8. Hệ thống assign role cho user account
9. Hệ thống tự động assign permissions từ role
10. Hệ thống log assignment vào audit trail
11. Hệ thống hiển thị thông báo thành công

**Alternative Flows**:

**A1: Role không phù hợp với position**
- 7a. Hệ thống phát hiện role không phù hợp
- 7b. Hệ thống cảnh báo và yêu cầu xác nhận
- 7c. Actor xác nhận (nếu có quyền override)
- Quay lại bước 8

**Postconditions**:
- Employee (thông qua user account) có role mới
- Permissions từ role được apply
- Assignment được log trong audit trail

---

### UC-HR-004: Record Attendance (Check-in/Check-out)

**Use Case ID**: UC-HR-004  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có status = Active
- Employee có quyền RECORD_ATTENDANCE

**Main Flow - Check-in**:
1. Employee chọn "Check-in"
2. Hệ thống lấy current time và location (nếu có GPS)
3. Hệ thống validate:
   - Employee chưa check-in trong ngày hôm nay
   - Current time >= 6:00 AM
4. Hệ thống tạo attendance record với:
   - Employee ID
   - Date (current date)
   - Check-in time (current time)
   - Location (if available)
   - Status = Checked In
5. Hệ thống hiển thị thông báo "Check-in successful"

**Main Flow - Check-out**:
1. Employee chọn "Check-out"
2. Hệ thống lấy current time và location
3. Hệ thống validate:
   - Employee đã check-in trong ngày hôm nay
   - Employee chưa check-out
   - Current time <= 11:59 PM
4. Hệ thống cập nhật attendance record:
   - Check-out time = current time
   - Working hours = Check-out - Check-in - Break time
   - Overtime hours = Working hours - 8 (nếu > 0)
   - Status = Completed
5. Hệ thống tính toán:
   - Late: Nếu check-in > 9:00 AM
   - Early Leave: Nếu check-out < 5:00 PM
6. Hệ thống hiển thị thông báo "Check-out successful" với working hours

**Alternative Flows**:

**A1: Check-in quá muộn**
- 3a. Hệ thống phát hiện check-in > 9:00 AM
- 3b. Hệ thống đánh dấu Late và yêu cầu nhập lý do
- 3c. Employee nhập lý do
- Quay lại bước 4

**A2: Check-out quá sớm**
- 3a. Hệ thống phát hiện check-out < 5:00 PM
- 3b. Hệ thống đánh dấu Early Leave và yêu cầu nhập lý do
- 3c. Employee nhập lý do
- Quay lại bước 4

**A3: Quên check-in hoặc check-out**
- 3a. Hệ thống phát hiện thiếu check-in hoặc check-out
- 3b. Hệ thống yêu cầu employee nhập thời gian thủ công
- 3c. Employee nhập thời gian và lý do
- 3d. Hệ thống tạo attendance record với status = Pending Approval
- 3e. Manager hoặc HR Manager phải approve

**Postconditions**:
- Attendance record được tạo/cập nhật
- Working hours và overtime được tính toán
- Attendance status được set (Completed hoặc Pending Approval)

---

### UC-HR-005: Request Leave

**Use Case ID**: UC-HR-005  
**Priority**: High  
**Actor**: Employee

**Preconditions**:
- Employee đã login vào hệ thống
- Employee có status = Active
- Employee có quyền REQUEST_LEAVE

**Main Flow**:
1. Employee chọn "Request Leave"
2. Hệ thống hiển thị form request leave
3. Employee nhập thông tin:
   - Leave type (Annual, Sick, Unpaid, etc.)
   - Start date
   - End date
   - Reason
   - Notes (optional)
4. Hệ thống validate:
   - Start date >= current date
   - End date >= Start date
   - Leave type có balance (nếu cần)
   - Leave balance >= số ngày request
5. Hệ thống tính số ngày nghỉ:
   - Leave days = End date - Start date + 1
   - Trừ các ngày nghỉ lễ và cuối tuần (nếu cần)
6. Hệ thống hiển thị:
   - Số ngày nghỉ
   - Leave balance trước và sau
   - Manager sẽ approve
7. Employee xác nhận và submit
8. Hệ thống tạo leave request với status = Pending
9. Hệ thống gửi notification cho Manager
10. Hệ thống hiển thị thông báo "Leave request submitted"

**Alternative Flows**:

**A1: Leave balance không đủ**
- 4a. Hệ thống phát hiện leave balance < số ngày request
- 4b. Hệ thống từ chối và hiển thị:
     - Leave balance hiện tại
     - Số ngày còn thiếu
     - Gợi ý request Unpaid Leave
- Use case kết thúc

**A2: Request nghỉ phép trong quá khứ**
- 4a. Hệ thống phát hiện Start date < current date
- 4b. Hệ thống yêu cầu approval đặc biệt từ HR Manager
- 4c. Employee nhập lý do đặc biệt
- 4d. Hệ thống tạo request với status = Pending HR Approval
- Quay lại bước 9

**A3: Request trùng với ngày đã có request khác**
- 4a. Hệ thống phát hiện trùng ngày với request khác
- 4b. Hệ thống cảnh báo và hiển thị request trùng
- 4c. Employee xác nhận hoặc thay đổi ngày
- Quay lại bước 3

**Postconditions**:
- Leave request được tạo với status = Pending
- Manager nhận được notification
- Leave balance chưa bị trừ (chỉ trừ khi được approve)

---

### UC-HR-006: Approve Leave Request

**Use Case ID**: UC-HR-006  
**Priority**: High  
**Actor**: Manager, HR Manager

**Preconditions**:
- Leave request đã được tạo
- Actor là Manager của employee hoặc HR Manager
- Actor có quyền APPROVE_LEAVE

**Main Flow**:
1. Actor nhận notification về leave request
2. Actor chọn "View Leave Requests"
3. Hệ thống hiển thị danh sách leave requests pending
4. Actor chọn leave request cần review
5. Hệ thống hiển thị chi tiết:
   - Employee information
   - Leave type
   - Start date và End date
   - Number of days
   - Reason
   - Leave balance before và after
6. Actor quyết định:
   
   **Option A: Approve**
   6a. Actor chọn "Approve"
   6b. Hệ thống validate:
       - Leave balance đủ
       - Không có conflict với requests khác
   6c. Hệ thống cập nhật:
       - Leave request status = Approved
       - Leave balance = Leave balance - Leave days
       - Approved by = Actor
       - Approved at = current timestamp
   6d. Hệ thống gửi notification cho Employee
   6e. Hệ thống hiển thị thông báo "Leave request approved"
   
   **Option B: Reject**
   6a. Actor chọn "Reject"
   6b. Hệ thống yêu cầu nhập rejection reason
   6c. Actor nhập rejection reason
   6d. Hệ thống cập nhật:
       - Leave request status = Rejected
       - Rejection reason
       - Rejected by = Actor
       - Rejected at = current timestamp
   6e. Hệ thống gửi notification cho Employee
   6f. Hệ thống hiển thị thông báo "Leave request rejected"

**Alternative Flows**:

**A1: Leave balance không đủ khi approve**
- 6b. Hệ thống phát hiện leave balance không đủ
- 6c. Hệ thống cảnh báo và đề xuất:
     - Approve với Unpaid Leave cho số ngày thiếu
     - Hoặc reject request
- 6d. Actor quyết định
- Quay lại bước 6

**Postconditions**:
- Leave request status được cập nhật (Approved/Rejected)
- Leave balance được cập nhật (nếu approved)
- Employee nhận được notification

---

### UC-HR-007: Create Department

**Use Case ID**: UC-HR-007  
**Priority**: High  
**Actor**: HR Manager, System Administrator

**Preconditions**:
- Actor đã login vào hệ thống
- Actor có quyền CREATE_DEPARTMENT

**Main Flow**:
1. Actor chọn "Create Department"
2. Hệ thống hiển thị form tạo department
3. Actor nhập thông tin:
   - Department name
   - Department code
   - Description
   - Parent department (optional)
   - Manager (optional)
4. Hệ thống validate:
   - Department code unique
   - Parent department tồn tại (nếu có)
   - Không có circular reference
   - Manager là employee Active (nếu có)
5. Hệ thống tạo department
6. Hệ thống tự động generate department_code nếu không nhập
7. Hệ thống hiển thị thông báo thành công

**Alternative Flows**:

**A1: Circular reference**
- 4a. Hệ thống phát hiện circular reference
- 4b. Hệ thống từ chối và hiển thị lỗi
- Use case kết thúc

**Postconditions**:
- Department được tạo trong hệ thống
- Department có thể được sử dụng để gán cho employees

---

### UC-HR-008: Create Position

**Use Case ID**: UC-HR-008  
**Priority**: High  
**Actor**: HR Manager, System Administrator

**Preconditions**:
- Actor đã login vào hệ thống
- Actor có quyền CREATE_POSITION

**Main Flow**:
1. Actor chọn "Create Position"
2. Hệ thống hiển thị form tạo position
3. Actor nhập thông tin:
   - Position name
   - Position code
   - Description
   - Level (1-10)
   - Department (optional - có thể là position chung)
4. Hệ thống validate:
   - Position code unique
   - Level trong khoảng 1-10
5. Hệ thống tạo position
6. Hệ thống tự động generate position_code nếu không nhập
7. Hệ thống hiển thị thông báo thành công

**Postconditions**:
- Position được tạo trong hệ thống
- Position có thể được sử dụng để gán cho employees

---

### UC-HR-009: Create Contract

**Use Case ID**: UC-HR-009  
**Priority**: High  
**Actor**: HR Manager, HR Staff

**Preconditions**:
- Employee đã được tạo
- Actor có quyền CREATE_CONTRACT

**Main Flow**:
1. Actor chọn employee cần tạo contract
2. Actor chọn "Create Contract"
3. Hệ thống hiển thị form tạo contract
4. Actor nhập thông tin:
   - Contract type (Full-time, Part-time, Contract, Intern)
   - Start date
   - End date
   - Contract value
   - Terms and conditions
   - Auto-renewal (yes/no)
5. Hệ thống validate:
   - Start date >= current date
   - End date >= Start date
   - Không có contract Active trùng thời gian
6. Hệ thống tạo contract với status = Draft
7. Actor review và chọn "Activate Contract"
8. Hệ thống validate:
   - Nếu có contract Active khác, phải đóng contract cũ trước
9. Hệ thống activate contract:
   - Status = Active
   - Employee contract được cập nhật
10. Hệ thống hiển thị thông báo thành công

**Alternative Flows**:

**A1: Có contract Active trùng thời gian**
- 5a. Hệ thống phát hiện contract Active trùng thời gian
- 5b. Hệ thống cảnh báo và yêu cầu:
     - Đóng contract cũ trước
     - Hoặc thay đổi thời gian contract mới
- 5c. Actor quyết định
- Quay lại bước 4

**Postconditions**:
- Contract được tạo và activate
- Employee có contract Active mới
- Contract cũ được đóng (nếu có)

---

### UC-HR-010: Terminate Employee

**Use Case ID**: UC-HR-010  
**Priority**: Critical  
**Actor**: HR Manager

**Preconditions**:
- Employee đã được tạo
- Actor có quyền TERMINATE_EMPLOYEE

**Main Flow**:
1. Actor chọn employee cần terminate
2. Actor chọn "Terminate Employee"
3. Hệ thống hiển thị form terminate
4. Actor nhập thông tin:
   - Termination date
   - Termination reason (required)
   - Notes (optional)
5. Hệ thống validate:
   - Termination date >= current date
   - Employee có status = Active hoặc Inactive
6. Hệ thống hiển thị cảnh báo:
   - Employee sẽ không thể login
   - Tất cả access sẽ bị revoke
   - Contract sẽ được đóng
   - Leave balance sẽ bị reset
7. Actor xác nhận terminate
8. Hệ thống thực hiện terminate:
   - Employee status = Terminated
   - User account status = Inactive
   - Tất cả roles và permissions bị revoke
   - Contract end_date = termination_date, status = Expired
   - Leave balance = 0
   - Termination record được tạo
9. Hệ thống log tất cả actions vào audit trail
10. Hệ thống hiển thị thông báo thành công

**Alternative Flows**:

**A1: Employee có pending tasks**
- 5a. Hệ thống phát hiện employee có pending tasks
- 5b. Hệ thống cảnh báo và hiển thị danh sách tasks
- 5c. Actor phải reassign tasks trước khi terminate
- Quay lại bước 1

**Postconditions**:
- Employee status = Terminated
- User account bị deactivate
- Tất cả access bị revoke
- Contract được đóng
- Termination được log trong audit trail

---

## 📊 Use Cases Summary

| UC ID | Use Case Name | Actor | Priority | Status |
|-------|---------------|-------|----------|--------|
| UC-HR-001 | Create Employee | HR Manager, HR Staff | Critical | Active |
| UC-HR-002 | Link Employee to User Account | HR Manager, System Admin | Critical | Active |
| UC-HR-003 | Assign Role to Employee | HR Manager, System Admin | Critical | Active |
| UC-HR-004 | Record Attendance | Employee | High | Active |
| UC-HR-005 | Request Leave | Employee | High | Active |
| UC-HR-006 | Approve Leave Request | Manager, HR Manager | High | Active |
| UC-HR-007 | Create Department | HR Manager, System Admin | High | Active |
| UC-HR-008 | Create Position | HR Manager, System Admin | High | Active |
| UC-HR-009 | Create Contract | HR Manager, HR Staff | High | Active |
| UC-HR-010 | Terminate Employee | HR Manager | Critical | Active |

---

## 🔗 Related Documents

- [Epic: HR Management](../product-owner/epic-hr-management.md)
- [Business Rules: HR Management](./business-rules-hr-management.md)
- [Database Architecture](../database-engineer/Database-Architecture.md#epic-008-hr-management)

---

**Last Updated**: November 2025  
**Next Review**: December 2025

