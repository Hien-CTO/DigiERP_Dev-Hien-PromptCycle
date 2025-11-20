# Test Cases: Attendance Management (Chấm Công)

## Overview
Test cases cho tính năng Attendance Management (Chấm Công) - FEAT-008-005, bao gồm check-in/check-out, xem lịch sử, chỉnh sửa, và phê duyệt chấm công.

## Test Scenarios

### Feature: Attendance Management (Chấm Công)

#### TC-ATT-001: Employee Check-In - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Use Case**: UC-ATT-001  
**Description**: Nhân viên check-in thành công đúng giờ

**Preconditions**:
- Employee đã login
- Employee chưa check-in trong ngày hôm nay
- Current time >= 6:00 AM

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Check In" button
3. System records check-in time
4. System displays check-in confirmation

**Expected Results**:
- Check-in thành công
- Check-in time được ghi nhận
- Status = CHECKED_IN
- Check-in button disabled, Check-out button enabled
- Check-in time hiển thị trên page

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-014: should check-in successfully on time`

---

#### TC-ATT-002: Employee Check-In - Late
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-001 (Alternative Flow A1)  
**Description**: Nhân viên check-in muộn

**Preconditions**:
- Employee đã login
- Current time > 9:00 AM (late threshold)

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Check In" button
3. System detects late check-in
4. System prompts for late reason (optional)
5. Enter late reason or skip
6. Confirm check-in

**Expected Results**:
- Check-in thành công
- Late = true
- Late minutes được tính
- Late indicator hiển thị
- Late reason được lưu (nếu có)

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-014: should check-in successfully but marked as late`

---

#### TC-ATT-003: Employee Check-In - Duplicate Prevention
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-001 (Alternative Flow A2)  
**Description**: Ngăn chặn check-in 2 lần trong cùng ngày

**Preconditions**:
- Employee đã check-in trong ngày hôm nay

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Try to click "Check In" again

**Expected Results**:
- Validation error: "Bạn đã check-in hôm nay rồi"
- Check-in không được ghi nhận
- Hiển thị thông tin check-in hiện tại

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-EC-001: should prevent duplicate check-in on same day`

---

#### TC-ATT-004: Employee Check-Out - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Use Case**: UC-ATT-002  
**Description**: Nhân viên check-out thành công sau khi đã check-in

**Preconditions**:
- Employee đã login
- Employee đã check-in trong ngày hôm nay
- Current time > check-in time

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Check Out" button
3. System records check-out time
4. System calculates working hours and overtime
5. System displays check-out confirmation

**Expected Results**:
- Check-out thành công
- Check-out time được ghi nhận
- Working hours được tính đúng
- Overtime hours được tính (nếu có)
- Status = COMPLETED hoặc PENDING_APPROVAL
- Check-out time hiển thị trên page

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-015: should check-out successfully after check-in`

---

#### TC-ATT-005: Employee Check-Out - Working Hours Calculation
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-002  
**Description**: Tính toán giờ làm việc chính xác

**Preconditions**:
- Employee đã check-in
- Employee chưa check-out

**Test Steps**:
1. Check-in at 8:30 AM
2. Wait (simulate work day)
3. Check-out at 5:30 PM
4. System calculates working hours

**Expected Results**:
- Working hours = (check-out - check-in) - break_time
- Overtime hours = working_hours - 8 (nếu > 0)
- Working hours hiển thị chính xác
- Overtime hours hiển thị (nếu có)

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-015: should calculate working hours correctly`

---

#### TC-ATT-006: Employee Check-Out - Early Leave
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-002 (Alternative Flow A1)  
**Description**: Check-out sớm với lý do

**Preconditions**:
- Employee đã check-in
- Current time < 5:00 PM (early leave threshold)

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Check Out" button
3. System detects early leave
4. System prompts for early leave reason
5. Enter reason
6. Confirm check-out

**Expected Results**:
- Check-out thành công
- Early leave = true
- Early leave minutes được tính
- Early leave reason được lưu
- Status = PENDING_APPROVAL
- Early leave indicator hiển thị

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should handle early leave with reason`

---

#### TC-ATT-007: Employee Check-Out - Without Check-In
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-002 (Alternative Flow A2)  
**Description**: Ngăn chặn check-out khi chưa check-in

**Preconditions**:
- Employee đã login
- Employee chưa check-in trong ngày hôm nay

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Try to click "Check Out" button

**Expected Results**:
- Validation error: "Bạn chưa check-in hôm nay"
- Check-out không được ghi nhận
- System suggests check-in first

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-EC-002: should prevent check-out without check-in`

---

#### TC-ATT-008: View Attendance History
**Priority**: Medium  
**Type**: E2E  
**Use Case**: UC-ATT-003  
**Description**: Xem lịch sử chấm công

**Preconditions**:
- Employee đã login
- Employee có quyền VIEW_OWN_ATTENDANCE

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. View attendance history table
3. Verify records display correctly

**Expected Results**:
- Attendance history table hiển thị
- Records hiển thị đầy đủ thông tin:
  - Date
  - Check-in time
  - Check-out time
  - Working hours
  - Status
  - Approval status
- Records được sắp xếp theo date (newest first)

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should display attendance history table`

---

#### TC-ATT-009: Filter Attendance History by Date Range
**Priority**: Medium  
**Type**: E2E  
**Use Case**: UC-ATT-003  
**Description**: Lọc lịch sử chấm công theo khoảng thời gian

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Select date range filter
3. Enter date from and date to
4. Apply filter

**Expected Results**:
- Only records within date range hiển thị
- Filter được apply đúng
- Records được update theo filter

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should filter attendance history by date range`

---

#### TC-ATT-010: Filter Attendance History by Status
**Priority**: Medium  
**Type**: E2E  
**Use Case**: UC-ATT-003  
**Description**: Lọc lịch sử chấm công theo trạng thái

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Select status filter
3. Choose status (COMPLETED, PENDING_APPROVAL, etc.)
4. Apply filter

**Expected Results**:
- Only records with selected status hiển thị
- Filter được apply đúng

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should filter attendance history by status`

---

#### TC-ATT-011: Edit Attendance Record - Within 24 Hours
**Priority**: Medium  
**Type**: E2E  
**Use Case**: UC-ATT-004  
**Description**: Chỉnh sửa bản ghi chấm công trong vòng 24 giờ

**Preconditions**:
- Employee đã login
- Attendance record được tạo trong vòng 24 giờ
- Record thuộc về employee

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Find attendance record
3. Click "Edit" button
4. Update check-in/check-out times
5. Enter edit reason (required)
6. Click "Save"

**Expected Results**:
- Edit form hiển thị
- Times được update
- Edit reason được lưu
- Status = PENDING_APPROVAL
- Audit log được tạo
- Success message hiển thị

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-004: should edit attendance record within 24 hours`

---

#### TC-ATT-012: Edit Attendance Record - Require Reason
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-004  
**Description**: Yêu cầu lý do khi chỉnh sửa

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Edit" on a record
3. Update times
4. Try to save without reason

**Expected Results**:
- Validation error: "Lý do chỉnh sửa là bắt buộc"
- Record không được update
- Form vẫn hiển thị

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should require edit reason`

---

#### TC-ATT-013: Edit Attendance Record - Validate Times
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-004 (Alternative Flow A2)  
**Description**: Validate check-out time phải sau check-in time

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Edit" on a record
3. Set check-out time < check-in time
4. Try to save

**Expected Results**:
- Validation error: "Check-out time phải sau check-in time"
- Record không được update

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should validate check-out time after check-in time`

---

#### TC-ATT-014: Approve Attendance Record
**Priority**: High  
**Type**: E2E  
**Use Case**: UC-ATT-005  
**Description**: Manager phê duyệt bản ghi chấm công

**Preconditions**:
- Manager đã login
- Manager có quyền APPROVE_ATTENDANCE
- Có attendance record pending approval

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. View pending approvals
3. Select attendance record
4. Click "Approve" button
5. Confirm approval

**Expected Results**:
- Approval thành công
- approval_status = APPROVED
- approved_by = manager user_id
- approved_at = current timestamp
- Employee được notify
- Success message hiển thị

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-016: should approve attendance record as manager`

---

#### TC-ATT-015: Reject Attendance Record
**Priority**: Medium  
**Type**: E2E  
**Use Case**: UC-ATT-005  
**Description**: Manager từ chối bản ghi chấm công

**Preconditions**:
- Manager đã login
- Có attendance record pending approval

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. View pending approvals
3. Select attendance record
4. Click "Reject" button
5. Enter rejection reason (required)
6. Click "Confirm Reject"

**Expected Results**:
- Rejection thành công
- approval_status = REJECTED
- rejected_by = manager user_id
- rejected_at = current timestamp
- rejection_reason được lưu
- Employee được notify với reason
- Success message hiển thị

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-017: should reject attendance record with reason`

---

#### TC-ATT-016: Export Attendance Data
**Priority**: Medium  
**Type**: E2E  
**Use Case**: UC-ATT-007  
**Description**: Xuất dữ liệu chấm công

**Preconditions**:
- Payroll Specialist đã login
- Payroll Specialist có quyền EXPORT_ATTENDANCE_DATA

**Test Steps**:
1. Navigate to `/admin/hr/attendance`
2. Click "Export" button
3. Select date range
4. Select format (Excel, CSV, JSON)
5. Click "Export"

**Expected Results**:
- Export file được generate
- File được download
- File chứa đầy đủ columns:
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
- Export action được log

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should export attendance data`

---

## Business Rules Validation

#### TC-ATT-BR-001: Approval Required for Late/Early Leave
**Priority**: High  
**Type**: E2E  
**Description**: Chấm công muộn/về sớm phải được phê duyệt

**Test Steps**:
1. Check-in late (> 9:00 AM)
2. Check-out early (< 5:00 PM)
3. Verify status = PENDING_APPROVAL

**Expected Results**:
- Status = PENDING_APPROVAL
- Record không được dùng cho payroll cho đến khi approved

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `TC-HR-BR-003: should require approval for late/early leave`

---

#### TC-ATT-BR-002: Overtime Calculation
**Priority**: High  
**Type**: E2E  
**Description**: Tính toán overtime chính xác

**Test Steps**:
1. Check-in at 8:00 AM
2. Check-out at 6:00 PM
3. Verify overtime calculation

**Expected Results**:
- Working hours = 9 hours (8:00 - 6:00 - 1 hour break)
- Overtime hours = 1 hour (9 - 8)
- Overtime được tính đúng

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should calculate overtime correctly`

---

## Edge Cases

#### TC-ATT-EC-001: Weekend Attendance
**Priority**: Low  
**Type**: E2E  
**Description**: Chấm công cuối tuần

**Test Steps**:
1. Check-in on weekend
2. Verify type = WEEKEND

**Expected Results**:
- Attendance type = WEEKEND
- Overtime rate = weekend rate (if applicable)

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should handle weekend attendance`

---

#### TC-ATT-EC-002: Holiday Attendance
**Priority**: Low  
**Type**: E2E  
**Description**: Chấm công ngày lễ

**Test Steps**:
1. Check-in on holiday
2. Verify type = HOLIDAY

**Expected Results**:
- Attendance type = HOLIDAY
- Overtime rate = holiday rate (if applicable)

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should handle holiday attendance`

---

#### TC-ATT-EC-003: Missing Location Data
**Priority**: Low  
**Type**: E2E  
**Description**: Chấm công không có GPS location

**Test Steps**:
1. Disable GPS/location services
2. Check-in

**Expected Results**:
- Check-in vẫn thành công
- Location = null hoặc empty
- Không có error

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should handle missing location data`

---

## Error Cases

#### TC-ATT-ERR-001: API Error Handling
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý lỗi API

**Test Steps**:
1. Mock API error (500)
2. Try to check-in

**Expected Results**:
- Error message được hiển thị
- User có thể retry
- Transaction được rollback

**Test File**: `tests/tests/hr/attendance-tests.js`  
**Test Function**: `should handle API errors gracefully`

---

## Test Coverage Summary

### Happy Path Coverage: ✅
- Check-in on time
- Check-out after check-in
- View attendance history
- Filter history
- Edit record (within 24h)
- Approve/reject record
- Export data

### Edge Cases Coverage: ✅
- Duplicate check-in/check-out
- Late check-in
- Early leave
- Weekend/Holiday attendance
- Missing location

### Error Cases Coverage: ✅
- API errors
- Validation errors
- Missing data

### Business Rules Coverage: ✅
- Approval workflow
- Overtime calculation
- Time validation

---

## Test Data Requirements

### Test Employees
- Employee 1: Active, Department=Sales, Position=Sales Staff
- Employee 2: Active, Department=HR, Position=HR Manager (for approval tests)

### Test Attendance Records
- Record 1: Normal check-in/check-out (8:30 AM - 5:30 PM)
- Record 2: Late check-in (10:00 AM)
- Record 3: Early leave (4:00 PM)
- Record 4: Overtime (8:00 AM - 7:00 PM)

---

## Notes
- All attendance operations maintain audit trail
- Approval workflow must be followed
- Overtime calculation must be accurate
- Location data is optional
- Tests should verify data consistency
- Tests should handle timezone differences
- Tests should verify notifications are sent

---

**Last Updated**: November 2025  
**Test Framework**: Playwright  
**Test Location**: `tests/tests/hr/attendance-tests.js`  
**Page Object**: `tests/pages/attendance-page.js`

