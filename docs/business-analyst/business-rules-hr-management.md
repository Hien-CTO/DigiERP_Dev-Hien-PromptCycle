# Business Rules - HR Management

## 📋 Tổng Quan

**Epic**: EPIC-008 - HR Management  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Business Analyst

Tài liệu này định nghĩa các Business Rules cho module Quản Lý Nhân Sự (HR Management) của hệ thống DigiERP.

---

## 🎯 Phạm Vi

Module HR Management bao gồm:
- Quản lý thông tin nhân viên (Employee Management)
- Quản lý phòng ban và chức vụ (Department & Position Management)
- Quản lý hợp đồng lao động (Contract Management)
- Quản lý chấm công (Attendance Management)
- Quản lý nghỉ phép (Leave Management)
- Tích hợp với User và Authorization (Employee-User Integration)

---

## 📜 Business Rules

### BR-HR-001: Employee Information Management

**Rule ID**: BR-HR-001  
**Priority**: Critical  
**Category**: Employee Management

**Description**: Quy tắc quản lý thông tin nhân viên cơ bản.

**Rules**:
1. Mỗi nhân viên phải có mã nhân viên (employee_code) duy nhất trong hệ thống
2. Mã nhân viên không được thay đổi sau khi tạo
3. Thông tin bắt buộc khi tạo nhân viên:
   - Họ và tên (full_name)
   - Ngày sinh (date_of_birth)
   - Số CMND/CCCD (id_number)
   - Email (email)
   - Số điện thoại (phone)
   - Địa chỉ (address)
4. Email phải unique trong hệ thống
5. Số CMND/CCCD phải unique trong hệ thống
6. Nhân viên phải được gán vào một phòng ban (department_id)
7. Nhân viên phải được gán vào một chức vụ (position_id)

**Validation Rules**:
- Email format phải hợp lệ
- Phone format phải hợp lệ (10-11 số)
- Date of birth phải trong quá khứ
- ID number phải đúng format (9 hoặc 12 số)

**Exception Handling**:
- Nếu email đã tồn tại, hệ thống hiển thị cảnh báo và yêu cầu xác nhận
- Nếu CMND/CCCD đã tồn tại, hệ thống từ chối tạo nhân viên mới

---

### BR-HR-002: Employee-User Account Linking

**Rule ID**: BR-HR-002  
**Priority**: Critical  
**Category**: Employee-User Integration

**Description**: Quy tắc liên kết giữa nhân viên và user account.

**Rules**:
1. Mỗi nhân viên có thể liên kết với tối đa 1 user account (one-to-one relationship)
2. Mỗi user account có thể liên kết với tối đa 1 nhân viên
3. Khi tạo nhân viên mới, hệ thống có thể tự động tạo user account hoặc liên kết với user account có sẵn
4. Khi nhân viên bị terminate, user account phải được deactivate (không xóa)
5. Khi nhân viên status thay đổi, user account status phải được sync tự động:
   - Employee Active → User Active
   - Employee Inactive → User Inactive
   - Employee Terminated → User Inactive
   - Employee On Leave → User Active (có thể truy cập hệ thống)

**Validation Rules**:
- Không thể tạo user account cho nhân viên đã có user account
- Không thể xóa user account nếu đang liên kết với nhân viên
- Phải có quyền HR_MANAGER hoặc SYSTEM_ADMIN để liên kết employee-user

**Exception Handling**:
- Nếu user account đã liên kết với nhân viên khác, hệ thống từ chối liên kết
- Nếu nhân viên đã có user account, hệ thống hiển thị thông tin user account hiện tại

---

### BR-HR-003: Department Management

**Rule ID**: BR-HR-003  
**Priority**: High  
**Category**: Department Management

**Description**: Quy tắc quản lý phòng ban.

**Rules**:
1. Mỗi phòng ban phải có mã phòng ban (department_code) duy nhất
2. Phòng ban có thể có phòng ban cha (parent_department_id) để tạo cấu trúc phân cấp
3. Không được phép tạo circular reference (phòng ban A là cha của B, B là cha của C, C không thể là cha của A)
4. Mỗi phòng ban phải có ít nhất 1 trưởng phòng (manager_id) - có thể là NULL nếu chưa bổ nhiệm
5. Trưởng phòng phải là nhân viên Active trong phòng ban đó
6. Khi xóa phòng ban, tất cả nhân viên trong phòng ban phải được chuyển sang phòng ban khác hoặc terminate

**Validation Rules**:
- Department code phải unique
- Parent department phải tồn tại và khác với department hiện tại
- Manager phải là nhân viên Active

**Exception Handling**:
- Nếu phòng ban có nhân viên, không thể xóa trực tiếp, phải chuyển nhân viên trước
- Nếu phòng ban có phòng ban con, không thể xóa, phải xóa hoặc chuyển phòng ban con trước

---

### BR-HR-004: Position Management

**Rule ID**: BR-HR-004  
**Priority**: High  
**Category**: Position Management

**Description**: Quy tắc quản lý chức vụ.

**Rules**:
1. Mỗi chức vụ phải có mã chức vụ (position_code) duy nhất
2. Chức vụ có thể có cấp độ (level) để phân cấp
3. Mỗi chức vụ có thể gán vào một phòng ban cụ thể hoặc là chức vụ chung (department_id = NULL)
4. Khi xóa chức vụ, tất cả nhân viên có chức vụ đó phải được gán chức vụ mới

**Validation Rules**:
- Position code phải unique
- Level phải là số nguyên dương (1-10)

**Exception Handling**:
- Nếu chức vụ đang được sử dụng bởi nhân viên, không thể xóa, phải gán chức vụ mới cho nhân viên trước

---

### BR-HR-005: Contract Management

**Rule ID**: BR-HR-005  
**Priority**: High  
**Category**: Contract Management

**Description**: Quy tắc quản lý hợp đồng lao động.

**Rules**:
1. Mỗi nhân viên phải có ít nhất 1 hợp đồng lao động Active tại một thời điểm
2. Hợp đồng có các loại: Full-time, Part-time, Contract, Intern
3. Hợp đồng có lifecycle: Draft → Active → Expired → Renewed/Cancelled
4. Start date phải <= End date
5. Không được có 2 hợp đồng Active cùng loại cho cùng một nhân viên trong cùng khoảng thời gian
6. Khi hợp đồng hết hạn (end_date < current_date), status tự động chuyển sang Expired
7. Hợp đồng có thể tự động gia hạn (auto_renewal = true)

**Validation Rules**:
- Start date phải trong quá khứ hoặc hiện tại
- End date phải >= Start date
- Contract value phải >= 0

**Exception Handling**:
- Nếu có hợp đồng Active trùng thời gian, hệ thống cảnh báo và yêu cầu xác nhận
- Nếu hợp đồng hết hạn nhưng chưa có hợp đồng mới, hệ thống cảnh báo HR Manager

---

### BR-HR-006: Attendance Management (Chấm Công)

**Rule ID**: BR-HR-006  
**Priority**: High  
**Category**: Attendance Management  
**Related Feature**: FEAT-008-005

**Description**: Quy tắc quản lý chấm công hàng ngày với check-in/check-out, tính toán giờ làm việc, overtime, và workflow phê duyệt.

**Rules**:

**BR-ATT-001: Attendance Recording Rules**
1. Mỗi nhân viên chỉ có thể check-in một lần mỗi ngày
2. Mỗi nhân viên chỉ có thể check-out một lần mỗi ngày
3. Check-in phải được thực hiện trước check-out trong cùng ngày
4. Check-in time không được sớm hơn 6:00 AM (configurable)
5. Check-out time không được muộn hơn 11:59 PM
6. Hệ thống phải ghi nhận location (GPS coordinates hoặc address) khi check-in/check-out
7. Nhân viên phải có status = Active mới có thể check-in/check-out
8. Nhân viên phải có quyền RECORD_ATTENDANCE

**BR-ATT-002: Working Hours Calculation**
1. Working hours = (Check-out time - Check-in time) - Break time
2. Break time mặc định = 1 giờ (configurable per department/position)
3. Working hours phải >= 0 và <= 16 giờ (giới hạn an toàn)
4. Nếu working hours < 0: Hệ thống báo lỗi và từ chối
5. Nếu working hours > 16: Hệ thống cảnh báo và yêu cầu xác nhận

**BR-ATT-003: Overtime Calculation**
1. Overtime hours = Working hours - Standard working hours (nếu > 0)
2. Standard working hours mặc định = 8 giờ/ngày (configurable)
3. Overtime chỉ được tính khi:
   - Working hours > Standard working hours
   - Hoặc làm việc vào cuối tuần (nếu được cấu hình)
   - Hoặc làm việc vào ngày lễ (nếu được cấu hình)
4. Overtime hours phải >= 0
5. Overtime rate được tính theo chính sách công ty (có thể khác nhau theo department/position)

**BR-ATT-004: Late Check-In and Early Leave Tracking**
1. Late check-in được đánh dấu khi check-in time > Late threshold (mặc định: 9:00 AM)
2. Late minutes = Check-in time - Late threshold
3. Early leave được đánh dấu khi check-out time < Early leave threshold (mặc định: 5:00 PM)
4. Early leave minutes = Early leave threshold - Check-out time
5. Late threshold và Early leave threshold có thể cấu hình khác nhau cho từng department/position
6. Khi có Late hoặc Early leave, attendance record tự động chuyển sang status = PENDING_APPROVAL
7. Employee có thể nhập lý do cho Late/Early leave (optional nhưng recommended)

**BR-ATT-005: Attendance Approval Workflow**
1. Attendance record phải được approve bởi Manager hoặc HR Manager trước khi sử dụng cho payroll
2. Manager chỉ có thể approve attendance records của nhân viên trong department của mình
3. HR Manager có thể approve attendance records của tất cả nhân viên
4. Attendance record có status = PENDING_APPROVAL nếu:
   - Có Late check-in
   - Có Early leave
   - Được edit bởi employee
   - Được tạo thủ công (missing check-in/check-out)
5. Attendance record có status = COMPLETED nếu:
   - Check-in và check-out đúng giờ (không Late, không Early leave)
   - Chưa được edit
6. Chỉ attendance records có approval_status = APPROVED mới được export cho payroll
7. Khi approve/reject, hệ thống phải gửi notification cho employee
8. Manager có thể bulk approve multiple records cùng lúc
9. Khi reject, Manager phải nhập rejection reason (required)

**BR-ATT-006: Attendance Edit Rules**
1. Employee chỉ có thể edit attendance record của chính mình
2. Employee chỉ có thể edit attendance record trong vòng 24 giờ kể từ check-in time
3. Sau 24 giờ, employee không thể edit mà phải yêu cầu Manager/HR Manager edit
4. Khi edit, employee phải nhập edit reason (required)
5. Sau khi edit, attendance record tự động chuyển sang status = PENDING_APPROVAL
6. Tất cả edits phải được log trong audit trail với:
   - Old values
   - New values
   - Edit reason
   - Edit timestamp
   - Editor (employee user_id)
7. Attendance record đã được approve không thể edit bởi employee (chỉ Manager/HR Manager có thể)

**BR-ATT-007: Attendance History and Viewing**
1. Employee chỉ có thể xem attendance records của chính mình
2. Manager có thể xem attendance records của tất cả nhân viên trong department
3. HR Manager có thể xem attendance records của tất cả nhân viên
4. Attendance records có thể được filter theo:
   - Date range
   - Status (Normal, Late, Early Leave, Overtime)
   - Approval status (Pending, Approved, Rejected)
   - Department (for Manager/HR Manager)
5. Attendance summary phải hiển thị:
   - Total working hours
   - Total overtime hours
   - Late count
   - Early leave count

**BR-ATT-008: Attendance Reports and Analytics**
1. HR Manager có thể generate attendance reports với:
   - Date range filter
   - Department filter
   - Employee filter
   - Report type (Summary, Detailed, Late/Early Analysis)
2. Reports phải bao gồm:
   - Attendance rate
   - Late check-in trends
   - Early leave trends
   - Overtime statistics
   - Department comparison
3. Reports có thể export dưới dạng: Excel, PDF, CSV
4. Hệ thống phải alert HR Manager khi phát hiện unusual attendance patterns

**BR-ATT-009: Attendance Data Export for Payroll**
1. Chỉ Payroll Specialist có quyền export attendance data
2. Export chỉ bao gồm approved attendance records (default)
3. Export có thể filter theo:
   - Date range (required)
   - Department (optional)
   - Employee (optional)
4. Export formats: Excel, CSV, JSON
5. Export data phải bao gồm:
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
6. Export action phải được log trong audit trail

**BR-ATT-010: Attendance Rules Configuration**
1. HR Manager có quyền configure attendance rules
2. Global rules (apply cho tất cả):
   - Standard working hours per day (default: 8 hours)
   - Break time (default: 1 hour)
   - Late threshold (default: 9:00 AM)
   - Early leave threshold (default: 5:00 PM)
   - Overtime calculation rules
3. Department-specific rules:
   - Có thể set different rules cho từng department
   - Department rules override global rules
4. Position-specific rules:
   - Có thể set different rules cho từng position
   - Position rules override department rules
5. Weekend and Holiday rules:
   - Có thể configure different rules cho weekend
   - Có thể configure different rules cho holidays
   - Weekend/Holiday attendance có thể có overtime rate khác

**Validation Rules**:
- Check-in và check-out phải trong cùng ngày
- Check-out time phải > Check-in time
- Working hours phải >= 0 và <= 16 (giới hạn an toàn)
- Overtime hours phải >= 0
- Late minutes phải >= 0
- Early leave minutes phải >= 0
- Location phải được ghi nhận (GPS hoặc address)

**Exception Handling**:
- Nếu check-in quá muộn (> Late threshold): Đánh dấu Late, yêu cầu lý do (optional), status = PENDING_APPROVAL
- Nếu check-out quá sớm (< Early leave threshold): Đánh dấu Early Leave, yêu cầu lý do (optional), status = PENDING_APPROVAL
- Nếu thiếu check-in hoặc check-out: Employee có thể tạo record thủ công, status = PENDING_APPROVAL, cần approval
- Nếu working hours < 0: Từ chối và hiển thị lỗi
- Nếu working hours > 16: Cảnh báo và yêu cầu xác nhận
- Nếu employee không active: Từ chối check-in/check-out
- Nếu duplicate check-in/check-out: Từ chối và hiển thị thông tin hiện tại

**Integration Rules**:
- Attendance records phải integrate với User Service để authenticate employee
- Approved attendance records phải integrate với Financial Service cho payroll calculation (planned)
- Attendance data phải sync real-time với payroll system (planned)

---

### BR-HR-007: Leave Management

**Rule ID**: BR-HR-007  
**Priority**: High  
**Category**: Leave Management  
**Related Feature**: FEAT-008-006

**Description**: Quy tắc quản lý nghỉ phép với nhiều loại nghỉ, approval workflow, và tự động tính toán leave balance.

**Rules**:

**BR-LEAVE-001: Leave Balance Management**
1. Mỗi nhân viên có leave balance cho từng loại nghỉ phép (per leave type)
2. Leave balance được tính dựa trên:
   - Loại hợp đồng (Full-time có nhiều ngày nghỉ hơn Part-time)
   - Thâm niên làm việc (tenure)
   - Chính sách công ty (company policy)
   - Position level (có thể có entitlements khác nhau)
3. Leave balance bao gồm:
   - Current balance (entitlement)
   - Used balance (từ approved leave requests)
   - Pending balance (từ pending leave requests)
   - Remaining balance = Current - Used - Pending
4. Leave balance được tự động cập nhật khi:
   - Leave request được approve (trừ balance)
   - Leave request bị reject hoặc cancel (hoàn lại balance)
   - Leave entitlements được tính toán (thêm balance)
   - Leave expires (trừ balance)

**BR-LEAVE-002: Leave Request Creation**
1. Employee chỉ có thể tạo leave request nếu:
   - Employee status = Active
   - Employee có quyền CREATE_LEAVE_REQUEST
2. Leave request phải có:
   - Leave type (required)
   - Start date (required)
   - End date (required)
   - Reason/notes (optional nhưng recommended)
3. Start date phải >= current date (trừ trường hợp đặc biệt với HR approval)
4. End date phải >= start date
5. Leave days được tính toán tự động:
   - Leave days = (end_date - start_date) + 1
   - Trừ weekends và holidays (theo company policy)
6. Hệ thống validate leave balance:
   - Nếu leave type có balance (Annual, Sick, Maternity, Paternity):
     - Remaining balance >= leave days requested
   - Nếu leave type không có balance (Unpaid, Emergency):
     - Không cần kiểm tra balance
7. Hệ thống kiểm tra overlap với existing leave requests:
   - Không được overlap với approved leave requests
   - Có thể overlap với pending leave requests (cảnh báo)
8. Leave request status mặc định = PENDING sau khi tạo

**BR-LEAVE-003: Leave Types và Rules**
1. **Annual Leave** (Nghỉ phép năm):
   - Có balance (dựa trên contract type và tenure)
   - Cần approval từ Manager
   - Có thể carry-over sang năm sau (tối đa 5 ngày, configurable)
   - Balance expires nếu không sử dụng (theo policy)
2. **Sick Leave** (Nghỉ ốm):
   - Có balance (standard entitlement per year, configurable)
   - Cần approval từ Manager
   - Requires medical certificate nếu > 3 days (configurable)
   - Balance có thể không expire (theo policy)
3. **Unpaid Leave** (Nghỉ không lương):
   - Không có balance (unlimited)
   - Cần approval từ Manager
   - Không ảnh hưởng đến lương (no salary during leave)
4. **Maternity Leave** (Nghỉ thai sản):
   - Chỉ dành cho nữ (gender restriction)
   - Có balance riêng (6 tháng, configurable)
   - Cần approval từ Manager/HR Manager
   - Paid leave
5. **Paternity Leave** (Nghỉ khi vợ sinh):
   - Chỉ dành cho nam (gender restriction)
   - Có balance riêng (5-10 ngày, configurable)
   - Cần approval từ Manager
   - Paid leave
6. **Emergency Leave** (Nghỉ khẩn cấp):
   - Không có balance (unlimited)
   - Unpaid leave
   - Cần approval từ Manager
   - For emergencies only
7. **Other** (Loại nghỉ khác):
   - Custom leave types
   - Rules configurable by HR Manager

**BR-LEAVE-004: Leave Request Approval Workflow**
1. Leave request phải được approve bởi Manager trước khi có hiệu lực
2. Manager chỉ có thể approve leave requests của employees trong department của mình
3. HR Manager có thể approve leave requests của tất cả employees
4. Manager không thể approve leave request của chính mình (phải chuyển lên cấp trên hoặc HR Manager)
5. Khi approve:
   - Manager có thể nhập approval notes (optional)
   - Hệ thống cập nhật status = APPROVED
   - Hệ thống trừ leave balance (nếu leave type có balance)
   - Hệ thống tạo attendance records (nếu integrated)
   - Hệ thống gửi notification cho Employee
6. Khi reject:
   - Manager phải nhập rejection reason (required)
   - Hệ thống cập nhật status = REJECTED
   - Hệ thống không trừ leave balance
   - Hệ thống gửi notification cho Employee với rejection reason
7. Manager có thể bulk approve multiple leave requests cùng lúc
8. Hệ thống kiểm tra team coverage trước khi approve:
   - Nếu approving leave sẽ gây insufficient coverage (configurable threshold):
     - Hệ thống cảnh báo Manager
     - Manager có thể approve anyway hoặc reject

**BR-LEAVE-005: Leave Request Edit và Cancel**
1. Employee chỉ có thể edit leave request nếu:
   - Status = PENDING hoặc APPROVED
   - Start date >= current date (chưa được taken)
2. Employee có thể edit:
   - Leave dates (start_date, end_date)
   - Leave type
   - Reason/notes
   - Attached documents
3. Khi edit leave request đã approved:
   - Employee phải nhập edit reason (required)
   - Hệ thống restore original leave balance
   - Hệ thống recalculate new leave balance
   - Status tự động chuyển về PENDING (cần approval lại)
4. Employee có thể cancel leave request nếu:
   - Status = PENDING hoặc APPROVED
   - Start date >= current date
5. Khi cancel leave request đã approved:
   - Hệ thống restore leave balance (hoàn lại)
   - Hệ thống update attendance records (nếu integrated)
6. Tất cả edits và cancellations phải được log trong audit trail:
   - Old values
   - New values
   - Edit/cancel reason
   - Timestamp
   - Editor (employee user_id)

**BR-LEAVE-006: Leave Entitlements Calculation**
1. Hệ thống tự động tính toán leave entitlements dựa trên:
   - Employee contract type (Full-time, Part-time, Contract, Intern)
   - Employee tenure (years of service)
   - Company policy và regulations
   - Employee position level
2. Leave entitlements được tính toán:
   - Tự động tại đầu mỗi năm (scheduled job)
   - Khi employee mới join (prorated entitlements)
   - Khi employee contract type thay đổi
   - Khi employee tenure thay đổi (anniversary)
3. Prorated entitlements cho new employees:
   - Entitlement = (Full entitlement * Remaining months) / 12
   - Tính từ join date đến cuối năm
4. Leave accrual rules:
   - Monthly accrual: Entitlement được cộng dần mỗi tháng
   - Quarterly accrual: Entitlement được cộng mỗi quý
   - Yearly accrual: Entitlement được cộng một lần vào đầu năm
5. Leave carry-over rules:
   - Annual Leave có thể carry-over tối đa 5 ngày (configurable)
   - Unused leave vượt quá carry-over limit sẽ expire
   - Carry-over balance expires vào cuối năm sau (configurable)
6. Leave expiration rules:
   - Một số leave types có expiration date
   - Unused leave sẽ expire nếu không sử dụng trước expiration date
   - Hệ thống tự động expire leave balance (scheduled job)

**BR-LEAVE-007: Leave History và Viewing**
1. Employee chỉ có thể xem leave history của chính mình
2. Manager có thể xem leave history của employees trong department
3. HR Manager có thể xem leave history của tất cả employees
4. Leave history bao gồm:
   - Leave requests với dates, types, days, status
   - Approval/rejection history (who, when, reason)
   - Edit history (nếu có)
   - Leave balance changes over time
5. Leave history có thể được filter by:
   - Date range
   - Leave type
   - Status (Pending, Approved, Rejected, Cancelled)
6. Leave history có thể được sort by:
   - Date (newest/oldest)
   - Leave type
   - Status
7. Leave history có thể được export to Excel/CSV

**BR-LEAVE-008: Manager Leave Dashboard**
1. Manager có thể xem leave dashboard cho team (employees in department)
2. Dashboard hiển thị:
   - Pending leave requests count (highlight)
   - Upcoming leave (next 30/60/90 days)
   - Current leave status (who is on leave now)
   - Leave calendar view (all team leave)
   - Leave statistics by leave type
3. Manager có thể filter by:
   - Employee
   - Date range
   - Leave type
4. Hệ thống alert Manager nếu:
   - Multiple employees request leave on same dates (coverage conflict)
   - Insufficient team coverage (configurable threshold)
5. Manager có thể export leave calendar

**BR-LEAVE-009: HR Manager Leave Overview**
1. HR Manager có thể xem leave overview cho toàn bộ organization
2. Overview bao gồm:
   - Total employees
   - Employees on leave (current)
   - Pending leave requests (organization-wide)
   - Leave utilization statistics
3. HR Manager có thể generate reports:
   - By department
   - By position
   - By employee
   - By date range
4. Reports bao gồm:
   - Leave utilization statistics
   - Leave balance analysis
   - Unusual patterns (frequent sick leave, excessive annual leave)
   - Leave forecast (projected usage)
5. Reports có thể export to Excel, PDF, CSV

**BR-LEAVE-010: Leave Types Configuration**
1. HR Manager có quyền configure leave types
2. Leave type configuration bao gồm:
   - Name, code, description
   - Max days per year
   - Carry-over rules (max days, expiration)
   - Requires approval (yes/no)
   - Requires medical certificate (if > X days)
   - Gender restriction (if applicable)
3. Leave entitlements configuration:
   - By contract type (Full-time, Part-time, etc.)
   - By tenure (years of service)
   - By position level
4. Approval workflow configuration:
   - Single-level (Manager only)
   - Multi-level (Manager → HR Manager)
5. Other rules configuration:
   - Minimum notice period
   - Maximum consecutive days
   - Blackout dates (dates when leave is not allowed)
   - Accrual rules (monthly, quarterly, yearly)
6. Configuration phải được validate:
   - Max days >= 0
   - Carry-over <= max days
   - All required fields filled
7. Configuration history được maintain (audit trail)

**BR-LEAVE-011: Integration with Attendance System**
1. Khi leave request được approve:
   - Hệ thống tự động mark attendance records as LEAVE cho leave period
   - Prevent check-in/check-out trên leave days
2. Khi leave request bị cancel:
   - Hệ thống remove LEAVE marks từ attendance records
   - Allow check-in/check-out again
3. Khi leave request được edit (dates changed):
   - Hệ thống update LEAVE marks trong attendance records
4. Attendance records phải sync real-time với leave status
5. Hệ thống validate leave dates không conflict với attendance records

**BR-LEAVE-012: Leave Request Notifications**
1. Hệ thống gửi notification khi:
   - Leave request được tạo (gửi cho Manager)
   - Leave request được approve (gửi cho Employee)
   - Leave request bị reject (gửi cho Employee với reason)
   - Leave request được edit/cancel (gửi cho Manager)
2. Hệ thống gửi reminder notifications:
   - Before leave start date (e.g., 1 day before)
   - If leave request pending > X days (configurable)
   - If leave balance low (< 3 days)
   - If leave balance about to expire (within 30 days)
3. Notifications được gửi qua:
   - Email
   - In-app notifications
4. Users có thể configure notification preferences

**Validation Rules**:
- Start date <= End date
- Leave days = (End date - Start date) + 1 (trừ weekends/holidays theo policy)
- Leave balance phải >= Leave days requested (cho paid leave types)
- Employee status phải = Active để tạo leave request
- Leave request không được overlap với approved leave requests
- Rejection reason phải có khi reject (minimum 10 characters)
- Edit reason phải có khi edit approved request

**Exception Handling**:
- Nếu leave balance không đủ: Hệ thống từ chối request và hiển thị balance hiện tại, shortage amount
- Nếu request nghỉ phép trùng với ngày đã có request khác: Hệ thống cảnh báo và hiển thị overlapping requests, yêu cầu xác nhận
- Nếu request nghỉ phép trong quá khứ: Hệ thống yêu cầu approval đặc biệt từ HR Manager
- Nếu sick leave > 3 days không có medical certificate: Hệ thống yêu cầu upload medical certificate
- Nếu leave type yêu cầu giới tính cụ thể (Maternity/Paternity): Hệ thống validate employee gender và từ chối nếu không match
- Nếu Manager approve own leave request: Hệ thống từ chối và đề xuất chuyển lên cấp trên
- Nếu approving leave gây insufficient team coverage: Hệ thống cảnh báo và yêu cầu xác nhận
- Nếu leave request đã được taken (start_date < current_date): Không thể edit/cancel, chỉ có thể tạo request mới

**Integration Rules**:
- Leave requests phải integrate với User Service để authenticate employee
- Approved leave requests phải integrate với Attendance Service để mark leave days
- Leave balance phải sync với Financial Service cho payroll calculation (planned)
- Leave data phải sync real-time với attendance system

---

### BR-HR-008: Role and Permission Assignment

**Rule ID**: BR-HR-008  
**Priority**: Critical  
**Category**: Employee-User Integration

**Description**: Quy tắc gán role và permission cho nhân viên.

**Rules**:
1. Role được gán cho nhân viên thông qua user account
2. Mỗi nhân viên có thể có nhiều roles (thông qua user account)
3. Permissions được tính từ tất cả roles của nhân viên (union)
4. Có default roles dựa trên position:
   - Manager positions → Manager role
   - Employee positions → Employee role
   - HR positions → HR role
5. Có default permissions dựa trên department:
   - Sales Department → Sales permissions
   - Warehouse Department → Warehouse permissions
   - Accounting Department → Accounting permissions
6. HR Manager có thể override default roles và permissions
7. System Admin có quyền gán bất kỳ role và permission nào

**Validation Rules**:
- Role phải tồn tại trong hệ thống
- Permission phải tồn tại trong hệ thống
- Không thể gán role không phù hợp với position (có thể override bởi System Admin)

**Exception Handling**:
- Nếu gán role không phù hợp, hệ thống cảnh báo và yêu cầu xác nhận
- Nếu revoke role quan trọng, hệ thống yêu cầu approval từ System Admin

---

### BR-HR-009: Employee Status Management

**Rule ID**: BR-HR-009  
**Priority**: Critical  
**Category**: Employee Management

**Description**: Quy tắc quản lý trạng thái nhân viên.

**Rules**:
1. Employee status: Active, Inactive, On Leave, Terminated
2. Chỉ nhân viên Active mới có thể:
   - Check-in/Check-out
   - Request leave
   - Được gán vào projects/tasks
3. Nhân viên Inactive không thể thực hiện các hoạt động trên nhưng vẫn có thể login
4. Nhân viên Terminated không thể login và tất cả access bị revoke
5. Khi nhân viên chuyển sang Terminated:
   - User account phải được deactivate
   - Tất cả roles và permissions phải được revoke
   - Hợp đồng phải được đóng (end_date = termination_date)
   - Leave balance được reset về 0
6. Status change phải có lý do (reason) và được approve bởi HR Manager

**Validation Rules**:
- Status transition phải hợp lệ:
  - Active → Inactive/On Leave/Terminated (OK)
  - Inactive → Active/Terminated (OK)
  - On Leave → Active/Inactive/Terminated (OK)
  - Terminated → (không thể chuyển sang status khác)

**Exception Handling**:
- Nếu chuyển sang Terminated, hệ thống yêu cầu xác nhận và nhập lý do
- Nếu nhân viên đang có pending tasks, hệ thống cảnh báo trước khi terminate

---

### BR-HR-010: Data Privacy and Security

**Rule ID**: BR-HR-010  
**Priority**: Critical  
**Category**: Security

**Description**: Quy tắc bảo mật và quyền riêng tư dữ liệu nhân sự.

**Rules**:
1. Chỉ HR Manager, HR Staff, và System Admin mới có quyền xem toàn bộ thông tin nhân viên
2. Manager chỉ có thể xem thông tin nhân viên trong phòng ban của mình
3. Nhân viên chỉ có thể xem thông tin của chính mình
4. Thông tin nhạy cảm (lương, bank account, ID number) chỉ HR Manager và System Admin mới xem được
5. Tất cả thay đổi thông tin nhân viên phải được log (audit trail)
6. Export dữ liệu nhân sự cần approval từ HR Manager
7. Xóa dữ liệu nhân viên (soft delete) chỉ có thể thực hiện sau 5 năm kể từ ngày terminate

**Validation Rules**:
- Mọi truy cập dữ liệu nhân sự phải được log
- Export dữ liệu phải có watermark và timestamp

**Exception Handling**:
- Nếu truy cập thông tin không được phép, hệ thống từ chối và log lại
- Nếu export dữ liệu lớn, hệ thống yêu cầu approval từ System Admin

---

## 📊 Business Rules Summary

| Rule ID | Category | Priority | Status |
|---------|----------|----------|--------|
| BR-HR-001 | Employee Management | Critical | Active |
| BR-HR-002 | Employee-User Integration | Critical | Active |
| BR-HR-003 | Department Management | High | Active |
| BR-HR-004 | Position Management | High | Active |
| BR-HR-005 | Contract Management | High | Active |
| BR-HR-006 | Attendance Management | High | Active |
| BR-HR-007 | Leave Management | High | Active |
| BR-HR-008 | Role and Permission | Critical | Active |
| BR-HR-009 | Employee Status | Critical | Active |
| BR-HR-010 | Data Privacy | Critical | Active |

---

## 🔗 Related Documents

- [Epic: HR Management](../product-owner/epic-hr-management.md)
- [Use Cases: HR Management](./use-cases-hr-management.md)
- [Database Architecture](../database-engineer/Database-Architecture.md#epic-008-hr-management)

---

**Last Updated**: November 2025  
**Next Review**: December 2025

