# Test Cases: HR Management (EPIC-008)

## Overview
Test cases cho Epic HR Management (EPIC-008) bao gồm quản lý nhân viên, phòng ban, chức vụ, hợp đồng lao động, chấm công, và nghỉ phép.

## Test Scenarios

### Feature 1: Employee Management

#### TC-HR-001: Create Employee - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo nhân viên mới với đầy đủ thông tin

**Test Steps**:
1. Navigate to `/admin/hr/employees`
2. Click "Add Employee"
3. Fill form:
   - Full Name: "Nguyễn Văn A"
   - Date of Birth: "1990-01-01"
   - ID Number: "001234567890"
   - Address: "123 Đường XYZ, Hà Nội"
   - Phone: "0123456789"
   - Email: "nguyenvana@company.com"
   - Department: Select department
   - Position: Select position
   - Status: Active
4. Click "Save"

**Expected Results**:
- Employee được tạo thành công
- Hiển thị trong danh sách employees
- Employee có thể được link với user account

#### TC-HR-002: Create Employee - Duplicate ID Number
**Priority**: High  
**Type**: E2E  
**Description**: Tạo nhân viên với ID number đã tồn tại

**Preconditions**:
- Đã có employee với ID number "001234567890"

**Test Steps**:
1. Try to create employee với ID number "001234567890"
2. Click "Save"

**Expected Results**:
- Validation error: "ID number đã tồn tại"
- Employee không được tạo

#### TC-HR-003: Link Employee to User Account
**Priority**: Critical  
**Type**: E2E  
**Description**: Liên kết nhân viên với user account

**Preconditions**:
- Đã có employee
- Đã có user account

**Test Steps**:
1. Navigate to employee detail
2. Click "Link User Account"
3. Select user account
4. Click "Save"

**Expected Results**:
- Employee được link với user account (one-to-one)
- Employee có thể login với user account
- Employee status sync với user account status

#### TC-HR-004: Update Employee Status
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật trạng thái nhân viên

**Preconditions**:
- Đã có employee với status = Active

**Test Steps**:
1. Navigate to employee detail
2. Click "Edit"
3. Change Status: Terminated
4. Enter termination reason
5. Click "Save"

**Expected Results**:
- Employee status = Terminated
- User account status = Inactive (auto sync)
- Termination reason được lưu
- Employee không thể login

### Feature 2: Department Management

#### TC-HR-005: Create Department - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo phòng ban mới

**Test Steps**:
1. Navigate to `/admin/hr/departments`
2. Click "Add Department"
3. Fill form:
   - Name: "Phòng Kinh Doanh"
   - Code: "SALES"
   - Description: "Phòng kinh doanh"
   - Parent Department: None (root)
4. Click "Save"

**Expected Results**:
- Department được tạo thành công
- Hiển thị trong department tree
- Code là unique

#### TC-HR-006: Create Department - Hierarchical Structure
**Priority**: High  
**Type**: E2E  
**Description**: Tạo phòng ban con

**Preconditions**:
- Đã có parent department "Phòng Kinh Doanh"

**Test Steps**:
1. Navigate to `/admin/hr/departments`
2. Click "Add Department"
3. Fill form:
   - Name: "Nhóm Bán Hàng Miền Bắc"
   - Parent Department: "Phòng Kinh Doanh"
4. Click "Save"

**Expected Results**:
- Department được tạo thành công
- Hiển thị dưới parent department trong tree
- Hierarchical structure đúng

#### TC-HR-007: Assign Department Manager
**Priority**: Medium  
**Type**: E2E  
**Description**: Gán trưởng phòng cho phòng ban

**Preconditions**:
- Đã có department
- Đã có employee

**Test Steps**:
1. Navigate to department detail
2. Click "Assign Manager"
3. Select employee
4. Click "Save"

**Expected Results**:
- Department manager được assign
- Manager được hiển thị trong department detail
- Manager có quyền approve leave requests cho department

### Feature 3: Position Management

#### TC-HR-008: Create Position
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo chức vụ mới

**Test Steps**:
1. Navigate to `/admin/hr/positions`
2. Click "Add Position"
3. Fill form:
   - Name: "Nhân Viên Kinh Doanh"
   - Code: "SALES_STAFF"
   - Description: "Nhân viên kinh doanh"
   - Level: 3
4. Click "Save"

**Expected Results**:
- Position được tạo thành công
- Position có thể được assign cho employees

#### TC-HR-009: Assign Position to Employee
**Priority**: High  
**Type**: E2E  
**Description**: Gán chức vụ cho nhân viên

**Preconditions**:
- Đã có employee
- Đã có position

**Test Steps**:
1. Navigate to employee detail
2. Click "Edit"
3. Select Position
4. Click "Save"

**Expected Results**:
- Position được assign cho employee
- Employee có permissions theo position
- Position được hiển thị trong employee profile

### Feature 4: Contract Management

#### TC-HR-010: Create Employee Contract - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo hợp đồng lao động

**Preconditions**:
- Đã có employee

**Test Steps**:
1. Navigate to employee detail
2. Click "Add Contract"
3. Fill form:
   - Contract Number: "CT-001"
   - Type: Full-time
   - Start Date: Today
   - End Date: Today + 1 year
   - Salary: 10000000
   - Status: Draft
4. Click "Save"

**Expected Results**:
- Contract được tạo với status = Draft
- Contract được link với employee
- Contract có thể được activated

#### TC-HR-011: Activate Contract
**Priority**: High  
**Type**: E2E  
**Description**: Kích hoạt hợp đồng lao động

**Preconditions**:
- Đã có contract với status = Draft

**Test Steps**:
1. Navigate to contract detail
2. Click "Activate Contract"
3. Confirm activation

**Expected Results**:
- Contract status = Active
- Contract start date = today
- Employee contract status được cập nhật

#### TC-HR-012: Contract Expiry
**Priority**: Medium  
**Type**: E2E  
**Description**: Hợp đồng hết hạn

**Preconditions**:
- Đã có contract với end_date = yesterday

**Test Steps**:
1. System check contract expiry (scheduled job)
2. View contract status

**Expected Results**:
- Contract status = Expired (auto update)
- Employee được thông báo về expiry
- Contract có thể được renewed

#### TC-HR-013: Renew Contract
**Priority**: Medium  
**Type**: E2E  
**Description**: Gia hạn hợp đồng

**Preconditions**:
- Đã có contract với status = Expired

**Test Steps**:
1. Navigate to contract detail
2. Click "Renew Contract"
3. Set new end date
4. Click "Save"

**Expected Results**:
- New contract được tạo từ expired contract
- Contract status = Active
- Contract history được maintain

### Feature 5: Attendance Management

#### TC-HR-014: Employee Check-In
**Priority**: Critical  
**Type**: E2E  
**Description**: Nhân viên check-in

**Preconditions**:
- Employee đã login
- Current time = 8:30 AM

**Test Steps**:
1. Navigate to employee dashboard
2. Click "Check In"
3. System record:
   - Check-in time: 8:30 AM
   - Location: GPS location (if available)
   - Date: Today
4. Confirm check-in

**Expected Results**:
- Attendance record được tạo
- Check-in time được ghi nhận
- Status = On Time (if check-in <= 9:00 AM)
- Status = Late (if check-in > 9:00 AM)

#### TC-HR-015: Employee Check-Out
**Priority**: Critical  
**Type**: E2E  
**Description**: Nhân viên check-out

**Preconditions**:
- Employee đã check-in
- Current time = 5:30 PM

**Test Steps**:
1. Navigate to employee dashboard
2. Click "Check Out"
3. System record:
   - Check-out time: 5:30 PM
   - Date: Today
4. System calculate:
   - Working hours = Check-out - Check-in - Break time
   - Overtime hours = Working hours - 8 (if > 0)
5. Confirm check-out

**Expected Results**:
- Check-out time được ghi nhận
- Working hours được tính đúng
- Overtime hours được tính (nếu có)
- Status = Normal (if check-out >= 5:00 PM)
- Status = Early Leave (if check-out < 5:00 PM)

#### TC-HR-016: Approve Attendance Record
**Priority**: High  
**Type**: E2E  
**Description**: Phê duyệt bản ghi chấm công

**Preconditions**:
- Đã có attendance record với status = Pending Approval

**Test Steps**:
1. Manager navigate to attendance records
2. View attendance record
3. Click "Approve"
4. Confirm approval

**Expected Results**:
- Attendance record status = Approved
- Attendance data được sử dụng cho payroll
- Employee được thông báo về approval

#### TC-HR-017: Reject Attendance Record
**Priority**: Medium  
**Type**: E2E  
**Description**: Từ chối bản ghi chấm công

**Preconditions**:
- Đã có attendance record với status = Pending Approval

**Test Steps**:
1. Manager navigate to attendance records
2. View attendance record
3. Click "Reject"
4. Enter rejection reason
5. Confirm rejection

**Expected Results**:
- Attendance record status = Rejected
- Rejection reason được lưu
- Employee được thông báo về rejection

### Feature 6: Leave Management

#### TC-HR-018: Create Leave Request - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo yêu cầu nghỉ phép

**Preconditions**:
- Employee có leave balance > 0
- Employee đã login

**Test Steps**:
1. Navigate to employee dashboard
2. Click "Request Leave"
3. Fill form:
   - Leave Type: Annual
   - Start Date: Tomorrow
   - End Date: Tomorrow + 2 days
   - Reason: "Nghỉ phép năm"
4. System validate:
   - Leave balance đủ
   - Dates không trùng với requests khác
   - Start date >= current date
5. Click "Submit"

**Expected Results**:
- Leave request được tạo với status = PENDING
- Leave request chờ manager approval
- Leave balance được reserve (chưa trừ)

#### TC-HR-019: Create Leave Request - Insufficient Balance
**Priority**: High  
**Type**: E2E  
**Description**: Tạo yêu cầu nghỉ phép khi không đủ số ngày phép

**Preconditions**:
- Employee có leave balance = 2 days
- Request yêu cầu 5 days

**Test Steps**:
1. Create leave request với 5 days
2. Click "Submit"

**Expected Results**:
- Validation error: "Không đủ số ngày phép. Available: 2, Required: 5"
- Leave request không được tạo
- Hoặc request được tạo với status = PENDING nhưng cần approval đặc biệt

#### TC-HR-020: Create Leave Request - Overlapping Dates
**Priority**: High  
**Type**: E2E  
**Description**: Tạo yêu cầu nghỉ phép trùng ngày với request khác

**Preconditions**:
- Employee đã có leave request từ 2025-12-01 đến 2025-12-05

**Test Steps**:
1. Try to create leave request từ 2025-12-03 đến 2025-12-07 (overlapping)
2. Click "Submit"

**Expected Results**:
- Validation error: "Ngày nghỉ trùng với yêu cầu nghỉ phép khác"
- Leave request không được tạo

#### TC-HR-021: Approve Leave Request
**Priority**: High  
**Type**: E2E  
**Description**: Phê duyệt yêu cầu nghỉ phép

**Preconditions**:
- Đã có leave request với status = PENDING
- Manager có quyền approve

**Test Steps**:
1. Manager navigate to leave requests
2. View leave request
3. Click "Approve"
4. Confirm approval

**Expected Results**:
- Leave request status = APPROVED
- Leave balance tự động trừ đi
- Employee được thông báo về approval
- Leave request được hiển thị trong calendar

#### TC-HR-022: Reject Leave Request
**Priority**: Medium  
**Type**: E2E  
**Description**: Từ chối yêu cầu nghỉ phép

**Preconditions**:
- Đã có leave request với status = PENDING

**Test Steps**:
1. Manager navigate to leave requests
2. View leave request
3. Click "Reject"
4. Enter rejection reason
5. Confirm rejection

**Expected Results**:
- Leave request status = REJECTED
- Rejection reason được lưu
- Leave balance không bị trừ
- Employee được thông báo về rejection

#### TC-HR-023: View Leave Balance
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem số ngày phép còn lại

**Preconditions**:
- Employee có leave balance

**Test Steps**:
1. Navigate to employee dashboard
2. View "Leave Balance" section
3. Check balance by leave type

**Expected Results**:
- Leave balance được hiển thị:
  - Annual: X days
  - Sick: Y days
  - Other: Z days
- Balance được tính real-time

### Feature 7: Employee-User Integration & Authorization

#### TC-HR-024: Assign Roles to Employee
**Priority**: Critical  
**Type**: E2E  
**Description**: Gán roles cho nhân viên thông qua user account

**Preconditions**:
- Employee đã được link với user account
- Đã có roles trong system

**Test Steps**:
1. Navigate to employee detail
2. Click "Manage Roles"
3. Select roles:
   - Role 1: Sales Representative
   - Role 2: Order Manager
4. Click "Save"

**Expected Results**:
- Roles được assign cho employee's user account
- Employee có permissions theo roles
- Role assignments được ghi nhận trong audit trail

#### TC-HR-025: Employee Status Sync with User Account
**Priority**: Critical  
**Type**: E2E  
**Description**: Trạng thái nhân viên sync với user account

**Preconditions**:
- Employee đã được link với user account
- Employee status = Active
- User account status = Active

**Test Steps**:
1. Update employee status = Terminated
2. Check user account status

**Expected Results**:
- User account status = Inactive (auto sync)
- User account không thể login
- Sync được thực hiện real-time

## Edge Cases

#### TC-HR-EC-001: Check-In Twice Same Day
**Priority**: Medium  
**Type**: E2E  
**Description**: Check-in 2 lần trong cùng ngày

**Preconditions**:
- Employee đã check-in

**Test Steps**:
1. Try to check-in again same day

**Expected Results**:
- Validation error: "Đã check-in trong ngày hôm nay"
- Check-in không được ghi nhận

#### TC-HR-EC-002: Check-Out Without Check-In
**Priority**: Medium  
**Type**: E2E  
**Description**: Check-out mà chưa check-in

**Test Steps**:
1. Try to check-out without check-in

**Expected Results**:
- Validation error: "Chưa check-in trong ngày hôm nay"
- Check-out không được ghi nhận

#### TC-HR-EC-003: Leave Request - Past Date
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo yêu cầu nghỉ phép với ngày trong quá khứ

**Test Steps**:
1. Create leave request với start_date = yesterday

**Expected Results**:
- Validation error: "Ngày bắt đầu phải >= ngày hiện tại"
- Leave request không được tạo

#### TC-HR-EC-004: Multiple Employees Same ID Number
**Priority**: High  
**Type**: E2E  
**Description**: Ngăn chặn nhiều nhân viên cùng ID number

**Expected Results**:
- ID number phải unique
- Validation error nếu duplicate

## Error Cases

#### TC-HR-ERR-001: API Error - HR Service Down
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi HR Service down

**Test Steps**:
1. Mock HR Service 500 error
2. Try to create employee

**Expected Results**:
- Error message được hiển thị
- User có thể retry
- Transaction được rollback

#### TC-HR-ERR-002: User Service Integration Error
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi User Service integration error

**Test Steps**:
1. Mock User Service error
2. Try to link employee với user account

**Expected Results**:
- Error message được hiển thị
- Employee không được link
- User có thể retry

## Business Rules Validation

#### TC-HR-BR-001: Employee-User One-to-One Relationship
**Priority**: Critical  
**Type**: E2E  
**Description**: Mỗi employee chỉ link với 1 user account

**Expected Results**:
- Employee không thể link với multiple user accounts
- User account không thể link với multiple employees

#### TC-HR-BR-002: Leave Balance Cannot Go Negative
**Priority**: Critical  
**Type**: E2E  
**Description**: Số ngày phép không được âm

**Expected Results**:
- Leave balance validation
- Leave request không được approve nếu balance < required days

#### TC-HR-BR-003: Attendance Approval Required
**Priority**: High  
**Type**: E2E  
**Description**: Chấm công phải được approve trước khi dùng cho payroll

**Expected Results**:
- Attendance data không được dùng cho payroll nếu chưa approved
- Approval workflow được enforce

## Test Data Requirements

### Test Employees
- Employee 1: Name="Nguyễn Văn A", ID="001234567890", Department=Sales, Position=Sales Staff, Status=Active
- Employee 2: Name="Trần Thị B", ID="001234567891", Department=HR, Position=HR Manager, Status=Active

### Test Departments
- Department 1: Name="Phòng Kinh Doanh", Code="SALES", Manager=Employee 1
- Department 2: Name="Phòng Nhân Sự", Code="HR", Manager=Employee 2

### Test Positions
- Position 1: Name="Nhân Viên Kinh Doanh", Code="SALES_STAFF", Level=3
- Position 2: Name="Trưởng Phòng Nhân Sự", Code="HR_MANAGER", Level=5

### Test Contracts
- Contract 1: Employee=Employee 1, Type=Full-time, Status=Active, Start Date=Today, End Date=Today+1year

### Test Leave Balances
- Employee 1: Annual=12 days, Sick=5 days
- Employee 2: Annual=10 days, Sick=3 days

## Test Coverage

### Happy Path Coverage: ✅
- Employee management
- Department management
- Position management
- Contract management
- Attendance management
- Leave management
- Employee-User integration

### Edge Cases Coverage: ✅
- Duplicate check-in/check-out
- Past dates
- Overlapping leave requests
- Multiple employees same ID

### Error Cases Coverage: ✅
- Service failures
- Integration errors

### Business Rules Coverage: ✅
- One-to-one relationship
- Leave balance validation
- Attendance approval workflow

## Notes
- All HR operations should maintain audit trail
- Employee-User integration is critical
- Leave balance must be accurate
- Attendance approval workflow must be followed
- Employee status sync with user account is automatic
- Tests should verify data consistency across services

