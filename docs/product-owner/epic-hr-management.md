# Epic: HR Management

## 📋 Thông Tin Epic

**Epic ID**: EPIC-008  
**Epic Name**: HR Management (Human Resources Management)  
**Priority**: Medium  
**Business Value**: Medium  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: hr-service, user-service, financial-service (for payroll - planned)  
**Related Database Tables**: employees, departments, positions, employee_contracts, attendance_records, leave_requests, leave_balances  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-008-hr-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-008-hr-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-008-hr-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-008-hr-management)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý nhân sự, phòng ban, chức vụ, hợp đồng lao động, chấm công, và nghỉ phép. Hệ thống hỗ trợ quản lý toàn bộ vòng đời nhân viên từ tuyển dụng đến nghỉ việc.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Quản lý nhân sự hiệu quả**: Tập trung hóa thông tin nhân sự
2. **Tăng năng suất**: Tự động hóa quy trình chấm công và nghỉ phép
3. **Tuân thủ**: Đảm bảo tuân thủ các quy định lao động
4. **Cải thiện trải nghiệm**: Cải thiện trải nghiệm nhân viên với self-service

---

## 🚀 Features

### Feature 1: Employee Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý thông tin nhân viên bao gồm profile, thông tin liên hệ, và trạng thái. Hệ thống quản lý toàn bộ hồ sơ nhân viên từ thông tin cá nhân, hợp đồng, đến phòng ban và chức vụ.

**User Stories**:
- As an **HR Manager**, I want to **create and manage employee information** so that **I can maintain employee database**
- As an **HR Staff**, I want to **view employee details** so that **I can provide HR support**
- As an **Employee**, I want to **view my profile** so that **I can see my information**
- As a **System Administrator**, I want to **link employees to user accounts** so that **employees can access the system with proper authentication**

**Acceptance Criteria**:
- ✅ System allows creating employees with personal information (full name, date of birth, ID number, address, phone, email)
- ✅ System links employees to user accounts in User Service (one-to-one relationship)
- ✅ System tracks employee status (Active, Inactive, On Leave, Terminated)
- ✅ System maintains employee creation and update history with audit trail
- ✅ System supports employee search and filtering by name, department, position, status
- ✅ System stores employee profile information: photo, emergency contact, bank account, tax information
- ✅ System links employees to departments and positions
- ✅ System maintains employee employment history (start date, end date, reason for termination)

---

### Feature 2: Department Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý phòng ban với cấu trúc phân cấp.

**User Stories**:
- As an **HR Manager**, I want to **create and manage departments** so that **I can organize employees**
- As a **Department Manager**, I want to **see my department structure** so that **I can manage my team**
- As an **Employee**, I want to **see my department** so that **I know my organizational structure**

**Acceptance Criteria**:
- ✅ System allows creating departments with name and description
- ✅ System supports hierarchical department structure (parent-child)
- ✅ System allows assigning department managers
- ✅ System tracks department creation and update history
- ✅ System displays department tree in UI

---

### Feature 3: Position Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý chức vụ và cấp độ trong tổ chức.

**User Stories**:
- As an **HR Manager**, I want to **create and manage positions** so that **I can define job roles**
- As a **Department Manager**, I want to **see position requirements** so that **I can hire appropriately**
- As an **Employee**, I want to **see my position** so that **I know my role**

**Acceptance Criteria**:
- ✅ System allows creating positions with name and description
- ✅ System supports position levels and requirements
- ✅ System links employees to positions
- ✅ System tracks position creation and update history
- ✅ System displays position information in employee profiles

---

### Feature 4: Contract Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý hợp đồng lao động với các loại hợp đồng khác nhau.

**User Stories**:
- As an **HR Manager**, I want to **create and manage employment contracts** so that **I can formalize employment**
- As an **Employee**, I want to **see my contract** so that **I know my employment terms**
- As a **Legal Manager**, I want to **track contract terms** so that **I can ensure compliance**

**Acceptance Criteria**:
- ✅ System supports contract types: Full-time, Part-time, Contract, Intern
- ✅ System manages contract lifecycle: Draft → Active → Expired → Renewed
- ✅ System tracks contract dates (start_date, end_date)
- ✅ System links contracts to employees
- ✅ System maintains contract history

**Contract Types**:
- **Full-time**: Nhân viên chính thức toàn thời gian
- **Part-time**: Nhân viên bán thời gian
- **Contract**: Hợp đồng có thời hạn
- **Intern**: Thực tập sinh

---

### Feature 5: Attendance Management (Chấm Công)
**Priority**: High  
**Status**: In Progress  
**Feature ID**: FEAT-008-005

**Mô tả**: Quản lý chấm công hàng ngày với check-in/check-out, tính toán giờ làm việc, overtime, và workflow phê duyệt. Hệ thống hỗ trợ tracking địa điểm (GPS), cảnh báo đi muộn/về sớm, và tích hợp với payroll.

**Business Value**:
- Tự động hóa quy trình chấm công, giảm thời gian xử lý thủ công
- Tăng độ chính xác trong tính toán giờ làm việc và overtime
- Đảm bảo tuân thủ quy định lao động về giờ làm việc
- Cung cấp dữ liệu chính xác cho payroll calculation

**User Stories**:

**US-008-005-001**: As an **Employee**, I want to **check in and check out daily** so that **my working hours are automatically recorded and I don't need to manually track my attendance**

**Acceptance Criteria**:
- ✅ Employee can check in via web app or mobile app
- ✅ System records check-in time with timestamp
- ✅ System records check-in location (GPS coordinates or address)
- ✅ System validates check-in time is not earlier than 6:00 AM (configurable, shows warning if earlier)
- ✅ System validates employee status is Active before allowing check-in/check-out
- ✅ System validates employee has RECORD_ATTENDANCE permission
- ✅ Employee can check out at the end of working day
- ✅ System records check-out time with timestamp
- ✅ System records check-out location (GPS coordinates or address)
- ✅ System prevents duplicate check-in for the same day (shows existing check-in information)
- ✅ System allows only one check-in and one check-out per day per employee
- ✅ System validates check-out time is after check-in time
- ✅ System validates check-out time is not later than 11:59 PM
- ✅ System displays current attendance status (checked in/checked out)
- ✅ System validates location is within allowed radius (if location validation is enabled)
- ✅ System automatically marks late check-in if check-in time > late threshold (default: 9:00 AM)
- ✅ System calculates late minutes when late check-in is detected
- ✅ System allows employee to enter late reason (optional but recommended)
- ✅ System automatically sets status to PENDING_APPROVAL if late check-in or early check-out

**US-008-005-002**: As an **Employee**, I want to **view my attendance history** so that **I can track my attendance records and verify my working hours**

**Acceptance Criteria**:
- ✅ Employee can view list of attendance records (only their own records)
- ✅ System displays attendance records with: date, check-in time, check-out time, working hours, overtime hours
- ✅ System supports filtering by date range, status, approval status
- ✅ System shows attendance status (Normal, Late, Early Leave, Overtime)
- ✅ System displays approval status (Pending, Approved, Rejected)
- ✅ System allows employee to view attendance summary (total working hours, total overtime hours, late count, early leave count)
- ✅ System displays location information (check-in/check-out locations)
- ✅ System shows late minutes and early leave minutes for each record
- ✅ System displays notes/reasons (late reason, early leave reason, edit reason, rejection reason)
- ✅ System shows approval history (who approved/rejected, when, reason if rejected)

**US-008-005-003**: As an **Employee**, I want to **edit my attendance record within 24 hours** so that **I can correct mistakes in check-in/check-out times**

**Acceptance Criteria**:
- ✅ Employee can edit attendance record within 24 hours of check-in
- ✅ System requires employee to enter edit reason (mandatory) when editing
- ✅ System requires approval for edited attendance records
- ✅ System logs all changes to attendance records with audit trail (old values, new values, edit reason, timestamp, editor)
- ✅ System prevents editing attendance records older than 24 hours without manager approval
- ✅ System prevents editing attendance records that have already been approved
- ✅ System shows edit history for each attendance record
- ✅ System automatically sets status to PENDING_APPROVAL after edit

**US-008-005-004**: As a **Manager**, I want to **approve or reject attendance records** so that **I can ensure attendance accuracy before payroll calculation**

**Acceptance Criteria**:
- ✅ Manager can view attendance records of employees in their department
- ✅ Manager can approve attendance records
- ✅ Manager can reject attendance records with reason
- ✅ System sends notification to employee when attendance is approved/rejected
- ✅ System only allows approved attendance records to be used for payroll
- ✅ System supports bulk approval for multiple attendance records
- ✅ System shows pending approval count for manager dashboard

**US-008-005-005**: As an **HR Manager**, I want to **monitor attendance patterns and late/early statistics** so that **I can identify attendance issues and take corrective actions**

**Acceptance Criteria**:
- ✅ System tracks late check-ins (after 9:00 AM by default)
- ✅ System tracks early check-outs (before 5:00 PM by default)
- ✅ System calculates late minutes and early leave minutes
- ✅ System provides attendance dashboard with statistics
- ✅ System shows attendance trends (monthly, weekly)
- ✅ System generates attendance reports by department, employee, date range
- ✅ System alerts HR Manager for unusual attendance patterns

**US-008-005-006**: As a **System**, I want to **automatically calculate working hours and overtime** so that **payroll calculation is accurate and automated**

**Acceptance Criteria**:
- ✅ System calculates working hours = check-out time - check-in time - break time
- ✅ System calculates overtime hours = working hours - standard working hours (if working hours > standard working hours)
- ✅ System validates working hours are between 0 and 16 hours (safety limit)
- ✅ System shows warning and requires confirmation if working hours exceed 16 hours
- ✅ System rejects attendance record if working hours < 0
- ✅ System supports configurable working hours per day (default: 8 hours)
- ✅ System supports configurable break time (default: 1 hour for lunch)
- ✅ System handles weekend and holiday attendance differently (different overtime rates)
- ✅ System calculates overtime rates based on company policy (can vary by department/position)
- ✅ System stores calculated hours in attendance record
- ✅ System supports department-specific and position-specific overtime calculation rules

**US-008-005-007**: As a **Payroll Specialist**, I want to **export attendance data for payroll calculation** so that **I can process payroll accurately and efficiently**

**Acceptance Criteria**:
- ✅ System allows exporting attendance data by date range (required field)
- ✅ System exports only approved attendance records by default (can include pending if needed)
- ✅ System exports data in formats: Excel, CSV, JSON
- ✅ System includes all required fields: employee ID, employee name, date, check-in time, check-out time, working hours, overtime hours, late minutes, early leave minutes, approval status
- ✅ System provides API endpoint for payroll service integration
- ✅ System supports filtering by department, employee, approval status
- ✅ System logs export action in audit trail with user, timestamp, and export parameters
- ✅ System shows warning if date range exceeds 3 months

**US-008-005-008**: As an **HR Manager**, I want to **configure attendance rules and policies** so that **the system enforces company attendance policies automatically**

**Acceptance Criteria**:
- ✅ System allows configuring standard working hours (default: 8 hours/day)
- ✅ System allows configuring break time (default: 1 hour)
- ✅ System allows configuring late threshold (default: 9:00 AM)
- ✅ System allows configuring early leave threshold (default: 5:00 PM)
- ✅ System allows configuring overtime calculation rules
- ✅ System allows configuring weekend and holiday attendance rules
- ✅ System supports different rules for different departments or positions

**US-008-005-009**: As an **Employee**, I want to **receive notifications about check-in/check-out reminders** so that **I don't forget to check in or check out**

**Acceptance Criteria**:
- ✅ System sends reminder notification before check-in time (e.g., 8:45 AM)
- ✅ System sends reminder notification before check-out time (e.g., 4:45 PM)
- ✅ System sends notification if employee hasn't checked in by late threshold
- ✅ System sends notification if employee hasn't checked out by end of day
- ✅ System supports email and in-app notifications
- ✅ System allows employees to configure notification preferences
- ✅ System sends notification when attendance is approved/rejected

**US-008-005-010**: As an **Employee**, I want to **check in/out using mobile app with location validation** so that **I can record attendance even when working remotely or at different locations**

**Acceptance Criteria**:
- ✅ Mobile app supports check-in/check-out functionality
- ✅ Mobile app captures GPS location automatically
- ✅ System validates location is within allowed radius (configurable)
- ✅ System allows manual location entry if GPS unavailable
- ✅ System supports offline mode for check-in/check-out (syncs when online)
- ✅ System displays location on map for verification
- ✅ System allows employee to add location notes

**US-008-005-011**: As a **Manager**, I want to **view real-time attendance status of my team** so that **I can monitor who is currently at work and manage team availability**

**Acceptance Criteria**:
- ✅ Manager can view real-time list of employees who are checked in
- ✅ Manager can see employees who haven't checked in yet
- ✅ System displays current working hours for each checked-in employee
- ✅ System shows late employees with late minutes
- ✅ System supports filtering by department, position, or team
- ✅ System updates in real-time without page refresh
- ✅ System shows attendance summary for the day (total checked in, pending, absent)

**US-008-005-012**: As an **HR Manager**, I want to **handle special attendance cases (holiday work, remote work, business trip)** so that **attendance records accurately reflect all working scenarios**

**Acceptance Criteria**:
- ✅ System supports marking attendance as holiday work
- ✅ System supports marking attendance as remote work
- ✅ System supports marking attendance as business trip
- ✅ System allows HR Manager to manually create attendance records for special cases
- ✅ System requires approval for special attendance types
- ✅ System calculates overtime correctly for holiday and weekend work
- ✅ System maintains audit trail for all special attendance records

**Acceptance Criteria (Tổng hợp)**:
- ✅ System allows daily attendance recording with check-in/check-out
- ✅ System records attendance location (GPS coordinates or address)
- ✅ System validates location within allowed radius (configurable)
- ✅ System calculates working hours automatically
- ✅ System calculates overtime hours automatically
- ✅ System tracks late check-ins and early check-outs
- ✅ System supports attendance approval workflow (Manager/HR Manager)
- ✅ System maintains complete attendance history with audit trail
- ✅ System allows employees to view their attendance records
- ✅ System allows employees to edit attendance within 24 hours (requires approval)
- ✅ System provides attendance reports and analytics
- ✅ System exports attendance data for payroll integration
- ✅ System supports configurable attendance rules and policies
- ✅ System supports special attendance cases (holiday work, remote work, business trip)
- ✅ System provides real-time attendance status dashboard for managers
- ✅ System sends notifications for check-in/check-out reminders
- ✅ System supports mobile app with offline mode
- ✅ System integrates with User Service for employee authentication
- ✅ System integrates with Financial Service for payroll (planned)
- ✅ System integrates with Notification Service for alerts and reminders

**Technical Requirements**:
- **Service**: hr-service
- **Database Tables**: attendance_records, cat_attendance_types, attendance_configurations (planned)
- **API Endpoints**: 
  - `POST /api/v1/attendance/check-in`
  - `POST /api/v1/attendance/check-out`
  - `GET /api/v1/attendance/records`
  - `GET /api/v1/attendance/records/:id`
  - `PUT /api/v1/attendance/records/:id`
  - `POST /api/v1/attendance/records/:id/approve`
  - `POST /api/v1/attendance/records/:id/reject`
  - `GET /api/v1/attendance/reports`
  - `GET /api/v1/attendance/export`
  - `GET /api/v1/attendance/realtime-status` (for managers)
  - `GET /api/v1/attendance/configurations`
  - `PUT /api/v1/attendance/configurations/:id`
  - `POST /api/v1/attendance/special-cases` (for HR Manager)
- **Mobile App Support**: 
  - Check-in/check-out via mobile app
  - GPS location capture
  - Offline mode with sync
- **Integration**: 
  - User Service (authentication)
  - Financial Service (payroll - planned)
  - Notification Service (reminders and alerts - planned)

**Dependencies**:
- Employee Management (Feature 1) - Must have employees before attendance tracking
- Employee-User Integration (Feature 7) - For employee authentication
- Financial Service - For payroll integration (planned)

---

### Feature 6: Leave Management (Nghỉ Phép)
**Priority**: High  
**Status**: In Progress  
**Feature ID**: FEAT-008-006

**Mô tả**: Quản lý nghỉ phép với nhiều loại nghỉ, approval workflow, và tự động tính toán leave balance. Hệ thống hỗ trợ nhân viên tạo yêu cầu nghỉ phép, quản lý leave balance, và tích hợp với attendance system.

**Business Value**:
- Giảm 60% thời gian xử lý yêu cầu nghỉ phép thủ công
- Tăng 95% độ chính xác trong tính toán leave balance
- Giảm 80% lỗi trong quản lý nghỉ phép
- Tăng 70% sự hài lòng của nhân viên với quy trình nghỉ phép

**User Stories**:
- As an **Employee**, I want to **create leave requests** so that **I can request time off and plan my leave in advance**
- As an **Employee**, I want to **view my leave balance** so that **I can plan my leave and know how many days I have available**
- As a **Manager**, I want to **approve or reject leave requests** so that **I can manage team availability and ensure adequate coverage**
- As an **HR Manager**, I want to **track leave balances and generate leave reports** so that **I can manage leave entitlements and monitor leave utilization**
- As a **System**, I want to **automatically calculate leave entitlements** so that **leave balance is accurate and reflects company policies**

**Acceptance Criteria**:
- ✅ System allows creating leave requests with leave type, dates, reason
- ✅ System validates leave balance before allowing leave requests
- ✅ System supports leave types: Annual, Sick, Unpaid, Maternity, Paternity, Emergency, Other
- ✅ System supports leave approval workflow (Manager/HR Manager)
- ✅ System automatically calculates and updates leave balance
- ✅ System tracks leave balance per employee per leave type
- ✅ System calculates leave entitlements automatically based on contract type, tenure, and company policies
- ✅ System maintains complete leave history with audit trail
- ✅ System prevents overlapping leave requests
- ✅ System integrates with attendance system to mark leave days
- ✅ System allows employees to edit/cancel pending leave requests
- ✅ System provides manager dashboard for team leave management
- ✅ System provides HR dashboard for organization-wide leave overview
- ✅ System sends notifications for leave status updates
- ✅ System supports mobile app for leave requests (planned)
- ✅ System exports leave data for reporting and analytics

**Leave Types**:
- **Annual**: Nghỉ phép năm - Paid leave, based on tenure, can carry-over (max 5 days)
- **Sick**: Nghỉ ốm - Paid leave, requires medical certificate if > 3 days
- **Unpaid**: Nghỉ không lương - No balance limit, no salary during leave
- **Maternity**: Nghỉ thai sản - 6 months for female employees, paid leave
- **Paternity**: Nghỉ khi vợ sinh - 5-10 days for male employees, paid leave
- **Emergency**: Nghỉ khẩn cấp - Unpaid leave for emergencies
- **Other**: Các loại nghỉ khác - Custom leave types with configurable rules

**Related Feature Document**: [Feature: Leave Management](./feature-leave-management.md)

---

### Feature 7: Employee-User Integration & Authorization
**Priority**: Critical  
**Status**: In Progress

**Mô tả**: Liên kết giữa Nhân viên với User trong hệ thống Authentication và Authorization để quản lý quyền truy cập và phân quyền.

**User Stories**:
- As a **System Administrator**, I want to **link employees to user accounts** so that **employees can login to the system**
- As an **HR Manager**, I want to **assign roles and permissions to employees** so that **employees have appropriate access rights**
- As an **Employee**, I want to **login with my user account** so that **I can access the system with my credentials**
- As a **Security Officer**, I want to **see employee authorization details** so that **I can audit access rights**

**Acceptance Criteria**:
- ✅ System links each employee to exactly one user account (one-to-one relationship)
- ✅ System allows assigning roles to employees through user accounts
- ✅ System supports role-based access control (RBAC) for employees
- ✅ System allows assigning permissions to employees based on their position and department
- ✅ System automatically syncs employee status changes to user account status
- ✅ System prevents creating duplicate user accounts for the same employee
- ✅ System maintains audit trail for role and permission assignments
- ✅ System supports department-based and position-based default permissions
- ✅ System allows revoking access when employee is terminated

**Integration Points**:
- **User Service**: For user account management and authentication
- **Role & Permission System**: For authorization and access control
- **Employee Status**: Automatically updates user account status (Active/Inactive)

---

### Feature 8: Employee Self-Service
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Cho phép nhân viên tự quản lý thông tin và yêu cầu.

**User Stories**:
- As an **Employee**, I want to **update my profile** so that **I can keep my information current**
- As an **Employee**, I want to **view my attendance and leave** so that **I can track my records**
- As an **Employee**, I want to **submit leave requests** so that **I can request time off**

**Acceptance Criteria**:
- ✅ System allows employees to view their profile
- ✅ System allows employees to update certain profile fields
- ✅ System allows employees to view attendance records
- ✅ System allows employees to view leave balance
- ✅ System allows employees to submit leave requests
- ✅ System provides employee dashboard

---

### Feature 9: HR Reporting
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Báo cáo nhân sự và analytics.

**User Stories**:
- As an **HR Manager**, I want to **see HR reports** so that **I can analyze HR metrics**
- As a **CEO**, I want to **see headcount reports** so that **I can track workforce size**
- As a **Finance Manager**, I want to **see payroll reports** so that **I can plan payroll costs**

**Acceptance Criteria**:
- ✅ System provides headcount reports
- ✅ System provides attendance reports
- ✅ System provides leave reports
- ✅ System provides department reports
- ✅ System exports reports to various formats

---

## 📊 Metrics & KPIs

### Business Metrics
- **Employee Data Accuracy**: > 95%
- **Attendance Accuracy**: > 98%
- **Leave Request Processing Time**: < 2 days
- **Employee Self-Service Adoption**: > 70%

### Technical Metrics
- **Attendance Recording Performance**: < 1 second
- **Leave Request Processing**: < 500ms
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **User Service**: For user account integration
- **Financial Service**: For payroll integration (planned)

### External Dependencies
- None

---

## 📝 Notes

- HR management is important for organizational management
- Employee self-service reduces HR workload
- Attendance and leave management ensures compliance
- Contract management formalizes employment relationships
- HR reporting provides insights for workforce planning

---

**Last Updated**: November 2025  
**Next Review**: December 2025

